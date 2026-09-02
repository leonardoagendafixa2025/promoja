import { Template, Product, Tenant, TemplateFormat } from '../types';
import { parseGoogleDriveUrl } from '../utils/googleDrive';

export interface RenderOptions {
  template: Template;
  product: Product;
  tenant: Tenant;
  width?: number;
  height?: number;
  qrCodeDataUrl?: string;
}

export const FORMAT_DIMENSIONS: Record<TemplateFormat, { width: number; height: number }> = {
  STORIES_9_16: { width: 1080, height: 1920 },
  FEED_1_1: { width: 1080, height: 1080 },
  FEED_4_5: { width: 1080, height: 1350 },
  TV_16_9: { width: 1920, height: 1080 },
  BANNER_16_9: { width: 1920, height: 1080 },
  FLYER_A4: { width: 1240, height: 1754 },
};

export class CanvasEngine {
  static async renderToCanvas(options: RenderOptions, canvasElement?: HTMLCanvasElement): Promise<HTMLCanvasElement> {
    const { template, product, tenant, qrCodeDataUrl } = options;
    const formatDims = FORMAT_DIMENSIONS[template.format] || FORMAT_DIMENSIONS.STORIES_9_16;
    
    const targetWidth = options.width || formatDims.width;
    const targetHeight = options.height || formatDims.height;

    const canvas = canvasElement || document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Não foi possível obter o contexto 2D do Canvas');

    const scaleX = targetWidth / formatDims.width;
    const scaleY = targetHeight / formatDims.height;

    const parsedProductImageUrl = parseGoogleDriveUrl(product.imageUrl);
    const parsedTenantLogoUrl = parseGoogleDriveUrl(tenant.brandKit.logoUrl || '');

    // 1. RENDERIZAR FUNDO
    if (template.bgGradient) {
      const gradient = ctx.createLinearGradient(0, 0, targetWidth, targetHeight);
      if (template.bgGradient.includes('#be123c') || template.bgGradient.includes('#e11d48')) {
        gradient.addColorStop(0, '#f43f5e');
        gradient.addColorStop(0.4, '#be123c');
        gradient.addColorStop(0.8, '#881337');
        gradient.addColorStop(1, '#4c0519');
      } else if (template.bgGradient.includes('#15803d')) {
        gradient.addColorStop(0, '#10b981');
        gradient.addColorStop(0.5, '#047857');
        gradient.addColorStop(1, '#022c22');
      } else if (template.bgGradient.includes('#991b1b')) {
        gradient.addColorStop(0, '#dc2626');
        gradient.addColorStop(0.6, '#7f1d1d');
        gradient.addColorStop(1, '#450a0a');
      } else {
        gradient.addColorStop(0, tenant.brandKit.primaryColor || '#1e293b');
        gradient.addColorStop(0.5, '#0f172a');
        gradient.addColorStop(1, '#020617');
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    } else {
      ctx.fillStyle = template.bgColor || tenant.brandKit.primaryColor || '#0f172a';
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    }

    // 2. SPOTLIGHT ATRÁS DO PRODUTO
    if (template.hasSpotlight !== false) {
      const spotX = targetWidth / 2;
      const spotY = targetHeight * 0.42;
      const radius = Math.min(targetWidth, targetHeight) * 0.45;

      const radialGrad = ctx.createRadialGradient(spotX, spotY, 10, spotX, spotY, radius);
      radialGrad.addColorStop(0, template.spotlightColor || 'rgba(255, 255, 255, 0.35)');
      radialGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
      radialGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = radialGrad;
      ctx.beginPath();
      ctx.arc(spotX, spotY, radius, 0, 2 * Math.PI);
      ctx.fill();
    }

    const imageCache: Map<string, HTMLImageElement> = new Map();

    const loadImage = (src: string): Promise<HTMLImageElement> => {
      if (imageCache.has(src)) return Promise.resolve(imageCache.get(src)!);
      return new Promise((resolve) => {
        const img = new Image();
        if (!src.startsWith('data:') && !src.startsWith('blob:')) {
          img.crossOrigin = 'anonymous';
        }
        img.onload = () => {
          imageCache.set(src, img);
          resolve(img);
        };
        img.onerror = () => {
          console.warn('Aviso: falha no carregamento de imagem para Canvas:', src.substring(0, 60));
          resolve(img);
        };
        img.src = src;
      });
    };

    if (parsedProductImageUrl) await loadImage(parsedProductImageUrl);
    if (parsedTenantLogoUrl) await loadImage(parsedTenantLogoUrl);
    if (qrCodeDataUrl) await loadImage(qrCodeDataUrl);

    const discountPercent = product.priceNormal > product.pricePromotional
      ? Math.round(((product.priceNormal - product.pricePromotional) / product.priceNormal) * 100)
      : 0;

    const sortedElements = [...template.elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    // 3. DESENHAR ELEMENTOS RESILIENTES
    for (const el of sortedElements) {
      const x = el.posX * scaleX;
      const y = el.posY * scaleY;
      const w = el.width * scaleX;
      const h = el.height * scaleY;

      ctx.save();

      if (el.rotation) {
        ctx.translate(x + w / 2, y + h / 2);
        ctx.rotate((el.rotation * Math.PI) / 180);
        ctx.translate(-(x + w / 2), -(y + h / 2));
      }

      switch (el.type) {
        case 'shape':
          ctx.fillStyle = el.bgColor || '#facc15';
          if (el.shadowBlur) {
            ctx.shadowColor = el.shadowColor || 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = el.shadowBlur * scaleX;
            ctx.shadowOffsetY = 8 * scaleY;
          }
          if (el.borderRadius) {
            const r = el.borderRadius * scaleX;
            ctx.beginPath();
            ctx.roundRect(x, y, w, h, r);
            ctx.fill();

            if (el.borderColor) {
              ctx.strokeStyle = el.borderColor;
              ctx.lineWidth = (el.borderWidth || 4) * scaleX;
              ctx.stroke();
            }
          } else {
            ctx.fillRect(x, y, w, h);
          }
          break;

        case 'image': {
          let hasRendered = false;
          if (parsedProductImageUrl && imageCache.has(parsedProductImageUrl)) {
            const img = imageCache.get(parsedProductImageUrl)!;
            if (img.width > 0 && img.height > 0) {
              const aspectImg = img.width / img.height;
              const aspectBox = w / h;
              let drawW = w;
              let drawH = h;
              let drawX = x;
              let drawY = y;

              if (aspectImg > aspectBox) {
                drawH = w / aspectImg;
                drawY = y + (h - drawH) / 2;
              } else {
                drawW = h * aspectImg;
                drawX = x + (w - drawW) / 2;
              }

              ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
              ctx.shadowBlur = 32 * scaleX;
              ctx.shadowOffsetY = 16 * scaleY;

              ctx.drawImage(img, drawX, drawY, drawW, drawH);
              hasRendered = true;
            }
          }

          // PLACEHOLDER VETORIAL CASO IMAGEM FALHE OU NÃO EXISTA
          if (!hasRendered) {
            ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 4 * scaleX;
            ctx.beginPath();
            ctx.roundRect(x, y, w, h, 24 * scaleX);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#ffffff';
            ctx.font = `900 ${28 * scaleX}px Outfit, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(product.name.slice(0, 24), x + w / 2, y + h / 2 - 10 * scaleY);

            ctx.font = `600 ${18 * scaleX}px Outfit, sans-serif`;
            ctx.fillStyle = '#94a3b8';
            ctx.fillText('PROMOJÁ OFERTAS', x + w / 2, y + h / 2 + 25 * scaleY);
          }
          break;
        }

        case 'starburst_badge':
        case 'discount_tag': {
          if (discountPercent > 0 || el.type === 'starburst_badge') {
            const centerX = x + w / 2;
            const centerY = y + h / 2;
            const outerRadius = Math.min(w, h) / 2;
            const innerRadius = outerRadius * 0.82;
            const points = 16;

            ctx.shadowColor = 'rgba(0,0,0,0.6)';
            ctx.shadowBlur = 20 * scaleX;
            ctx.shadowOffsetY = 10 * scaleY;

            ctx.fillStyle = el.bgColor || '#10b981';
            ctx.beginPath();
            for (let i = 0; i < points * 2; i++) {
              const r = i % 2 === 0 ? outerRadius : innerRadius;
              const angle = (i * Math.PI) / points;
              const px = centerX + r * Math.cos(angle);
              const py = centerY + r * Math.sin(angle);
              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();

            ctx.shadowColor = 'transparent';
            ctx.fillStyle = el.fontColor || '#ffffff';
            ctx.font = `900 ${(el.fontSize || 46) * scaleX}px Outfit, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`-${discountPercent}%`, centerX, centerY - 8 * scaleY);

            ctx.font = `900 ${(el.fontSize ? el.fontSize * 0.42 : 22) * scaleX}px Outfit, sans-serif`;
            ctx.fillText(`OFF`, centerX, centerY + 32 * scaleY);
          }
          break;
        }

        case 'ribbon_banner': {
          ctx.fillStyle = el.bgColor || '#f59e0b';
          ctx.shadowColor = 'rgba(0,0,0,0.5)';
          ctx.shadowBlur = 18 * scaleX;

          ctx.beginPath();
          ctx.moveTo(x - 20 * scaleX, y);
          ctx.lineTo(x + w + 20 * scaleX, y);
          ctx.lineTo(x + w, y + h);
          ctx.lineTo(x, y + h);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = el.fontColor || '#0f172a';
          ctx.font = `900 ${(el.fontSize || 42) * scaleX}px Outfit, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(el.content || product.highlightTag || 'SUPER OFERTA', x + w / 2, y + h / 2);
          break;
        }

        case 'text':
        case 'brand_info': {
          let text = el.content || '';
          if (el.dynamicField) {
            text = el.dynamicField
              .replace('{{nome_produto}}', product.name)
              .replace('{{nome_empresa}}', tenant.name)
              .replace('{{instagram_empresa}}', tenant.brandKit.instagram)
              .replace('{{telefone_empresa}}', tenant.brandKit.phone)
              .replace('{{tag_destaque}}', product.highlightTag || 'SUPER OFERTA');
          }

          ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
          ctx.shadowBlur = 12 * scaleX;
          ctx.shadowOffsetY = 4 * scaleY;

          ctx.fillStyle = el.fontColor || '#ffffff';
          const styleStr = el.fontStyle === 'bold' || el.fontStyle === 'black' ? '900 ' : '';
          let fontSize = (el.fontSize || 36) * scaleX;
          const fontFamily = el.fontFamily || tenant.brandKit.fontFamily || 'Outfit';

          // AUTO-FIT DE FONTE SE O TEXTO FOR MUITO EXTENSO
          ctx.font = `${styleStr}${fontSize}px ${fontFamily}, sans-serif`;
          const measured = ctx.measureText(text).width;
          if (measured > w * 2.2) {
            fontSize = fontSize * 0.75;
            ctx.font = `${styleStr}${fontSize}px ${fontFamily}, sans-serif`;
          }

          ctx.textAlign = (el.alignment as CanvasTextAlign) || 'center';
          ctx.textBaseline = 'top';

          let textX = x;
          if (el.alignment === 'center') textX = x + w / 2;
          if (el.alignment === 'right') textX = x + w;

          this.wrapText(ctx, text, textX, y, w, fontSize * 1.22);
          break;
        }

        case 'price_normal': {
          if (product.priceNormal > 0) {
            const formatted = `De R$ ${product.priceNormal.toFixed(2).replace('.', ',')}`;
            ctx.fillStyle = el.fontColor || '#cbd5e1';
            const fontSize = (el.fontSize || 34) * scaleX;
            ctx.font = `bold ${fontSize}px Outfit, sans-serif`;
            ctx.textAlign = (el.alignment as CanvasTextAlign) || 'center';
            ctx.textBaseline = 'middle';

            let textX = x;
            if (el.alignment === 'center') textX = x + w / 2;

            ctx.fillText(formatted, textX, y + h / 2);

            const textWidth = ctx.measureText(formatted).width;
            ctx.strokeStyle = '#f43f5e';
            ctx.lineWidth = 5 * scaleX;
            ctx.beginPath();
            const strikeX = textX - (el.alignment === 'center' ? textWidth / 2 : 0);
            ctx.moveTo(strikeX, y + h / 2);
            ctx.lineTo(strikeX + textWidth, y + h / 2);
            ctx.stroke();
          }
          break;
        }

        case 'price_promotional': {
          const formatted = `R$ ${product.pricePromotional.toFixed(2).replace('.', ',')}`;
          
          ctx.shadowColor = 'rgba(0,0,0,0.85)';
          ctx.shadowBlur = 24 * scaleX;
          ctx.shadowOffsetY = 10 * scaleY;

          ctx.fillStyle = el.fontColor || '#facc15';
          let fontSize = (el.fontSize || 96) * scaleX;

          // AUTO-SCALE PARA PREÇOS EXTENSOS
          ctx.font = `900 ${fontSize}px Outfit, sans-serif`;
          const measuredPriceWidth = ctx.measureText(formatted).width;
          if (measuredPriceWidth > w * 0.95) {
            const scale = (w * 0.95) / measuredPriceWidth;
            fontSize = fontSize * scale;
            ctx.font = `900 ${fontSize}px Outfit, sans-serif`;
          }

          ctx.textAlign = (el.alignment as CanvasTextAlign) || 'center';
          ctx.textBaseline = 'middle';

          let textX = x;
          if (el.alignment === 'center') textX = x + w / 2;

          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 8 * scaleX;
          ctx.strokeText(formatted, textX, y + h / 2);

          ctx.fillText(formatted, textX, y + h / 2);
          break;
        }

        case 'logo': {
          if (parsedTenantLogoUrl && imageCache.has(parsedTenantLogoUrl)) {
            const logo = imageCache.get(parsedTenantLogoUrl)!;
            if (logo.width > 0) {
              ctx.drawImage(logo, x, y, w, h);
            }
          }
          break;
        }

        case 'qr_code': {
          if (qrCodeDataUrl && imageCache.has(qrCodeDataUrl)) {
            const qr = imageCache.get(qrCodeDataUrl)!;
            if (qr.width > 0) {
              ctx.drawImage(qr, x, y, w, h);
            }
          }
          break;
        }
      }

      ctx.restore();
    }

    return canvas;
  }

  private static wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
  }

  static downloadCanvas(canvas: HTMLCanvasElement, fileName: string) {
    const link = document.createElement('a');
    link.download = fileName;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
