export class SkuGenerator {

    /**
     * Common abbreviations.
     * Easy to extend later.
     */
    private static readonly WORD_MAP = new Map<string, string>([
        ['BLACK', 'BLK'],
        ['BLUE', 'BLU'],
        ['WHITE', 'WHT'],
        ['GREEN', 'GRN'],
        ['RED', 'RED'],
        ['YELLOW', 'YLW'],
        ['ORANGE', 'ORG'],
        ['PURPLE', 'PRP'],
        ['PINK', 'PNK'],
        ['BROWN', 'BRN'],
        ['GRAY', 'GRY'],
        ['GREY', 'GRY'],
        ['SILVER', 'SLV'],
        ['GOLD', 'GLD'],
        ['ROSE', 'RSE'],
        ['LIGHT', 'LGT'],
        ['DARK', 'DRK'],
        ['SMALL', 'SML'],
        ['MEDIUM', 'MED'],
        ['LARGE', 'LRG'],
        ['EXTRA', 'EXT'],
        ['MATTE', 'MAT'],
        ['GLOSSY', 'GLS'],
        ['NAVY', 'NVY'],
    ]);

    static generateBaseSku(
        productName: string,
        categoryName: string
    ): string {

        const categoryCode = this.generateCategoryCode(categoryName);
        const productCode = this.generateProductCode(productName);

        return [categoryCode, productCode]
            .filter(Boolean)
            .join('-')
            .toUpperCase();
    }

    static generateVariantSku(
        baseSku: string,
        attributes: string[]
    ): string {

        const suffix = attributes
            .map(attr => this.abbreviateValue(attr))
            .join('-');

        return [baseSku, suffix]
            .filter(Boolean)
            .join('-');
    }

    private static generateCategoryCode(categoryName: string): string {

        if (!categoryName?.trim()) {
            return 'GEN';
        }

        return categoryName
            .trim()
            .split(/\s+/)
            .map(word => word.substring(0, 2))
            .join('')
            .toUpperCase();
    }

    private static generateProductCode(productName: string): string {

        return productName
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map(word => word.substring(0, 3))
            .join('')
            .toUpperCase();
    }

    private static abbreviateValue(value: string): string {

        return value
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .map(word => this.abbreviateWord(word))
            .join('');
    }

    private static abbreviateWord(word: string): string {

        const normalized = this.normalize(word);

        const known = this.WORD_MAP.get(normalized);

        if (known) {
            return known;
        }

        return normalized.substring(0, 3);
    }

    private static normalize(value: string): string {

        return value
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '');
    }
}