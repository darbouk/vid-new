export interface BrandLogo {
    id: string;
    name: string;
    url: string;
}

export interface BrandColor {
    id: string;
    name: string;
    hex: string;
}

export interface BrandFont {
    id: string;
    name: string;
    fontFamily: string;
    type: 'primary' | 'secondary' | 'body';
}

export interface BrandKit {
    logos: BrandLogo[];
    colors: BrandColor[];
    fonts: BrandFont[];
}
