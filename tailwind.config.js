/** Ported verbatim from the inline tailwind.config that the CDN build used.
 *  Keep in sync with index.html if design tokens ever change. */
      module.exports = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
                    "white": "#FFFFFF",
                    "on-background": "#1a1c1c",
                    "on-error": "#ffffff",
                    "error": "#ba1a1a",
                    "primary": "#000000",
                    "outline-variant": "#cfc4c5",
                    "surface-dim": "#dadada",
                    "secondary-fixed-dim": "#c8c6c6",
                    "on-primary-container": "#848484",
                    "surface-bright": "#f9f9f9",
                    "surface": "#f9f9f9",
                    "outline": "#7e7576",
                    "secondary": "#5f5e5e",
                    "tertiary-fixed": "#e2e2e2",
                    "on-secondary-fixed-variant": "#474747",
                    "on-secondary-container": "#656464",
                    "inverse-on-surface": "#f1f1f1",
                    "error-container": "#ffdad6",
                    "inverse-primary": "#c6c6c6",
                    "primary-fixed": "#e2e2e2",
                    "tertiary": "#000000",
                    "background": "#f9f9f9",
                    "tertiary-fixed-dim": "#c6c6c6",
                    "on-tertiary": "#ffffff",
                    "gray-dark": "#666666",
                    "surface-container-high": "#e8e8e8",
                    "on-primary-fixed": "#1b1b1b",
                    "tertiary-container": "#1b1b1b",
                    "on-tertiary-container": "#848484",
                    "gray-light": "#E5E5E5",
                    "surface-container-lowest": "#ffffff",
                    "on-tertiary-fixed-variant": "#474747",
                    "surface-container": "#eeeeee",
                    "on-secondary-fixed": "#1b1c1c",
                    "on-surface-variant": "#4c4546",
                    "primary-container": "#1b1b1b",
                    "on-tertiary-fixed": "#1b1b1b",
                    "on-primary-fixed-variant": "#474747",
                    "surface-container-low": "#f3f3f3",
                    "on-error-container": "#93000a",
                    "primary-fixed-dim": "#c6c6c6",
                    "secondary-fixed": "#e4e2e1",
                    "secondary-container": "#e4e2e1",
                    "on-primary": "#ffffff",
                    "on-secondary": "#ffffff",
                    "surface-variant": "#e2e2e2",
                    "surface-container-highest": "#e2e2e2",
                    "surface-tint": "#5e5e5e",
                    "on-surface": "#1a1c1c",
                    "inverse-surface": "#2f3131"
            },
            "borderRadius": {
                    "DEFAULT": "0px",
                    "lg": "0px",
                    "xl": "0px",
                    "full": "0px"
            },
            "spacing": {
                    "stack-lg": "32px",
                    "margin-desktop": "64px",
                    "gutter": "32px",
                    "stack-md": "16px",
                    "margin-mobile": "20px",
                    "section-gap": "80px",
                    "container-max": "1200px",
                    "stack-sm": "8px"
            },
            "fontFamily": {
                    "body-sm": [
                            "Inter"
                    ],
                    "label-sm": [
                            "JetBrains Mono"
                    ],
                    "headline-lg-mobile": [
                            "Hanken Grotesk"
                    ],
                    "body-md": [
                            "Inter"
                    ],
                    "headline-xl": [
                            "Hanken Grotesk"
                    ],
                    "headline-lg": [
                            "Hanken Grotesk"
                    ],
                    "label-md": [
                            "JetBrains Mono"
                    ],
                    "body-lg": [
                            "Inter"
                    ],
                    "headline-xl-mobile": [
                            "Hanken Grotesk"
                    ],
                    "headline-md": [
                            "Hanken Grotesk"
                    ]
            },
            "fontSize": {
                    "body-sm": [
                            "14px",
                            {
                                    "lineHeight": "1.5",
                                    "fontWeight": "400"
                            }
                    ],
                    "label-sm": [
                            "11px",
                            {
                                    "lineHeight": "1.2",
                                    "fontWeight": "500"
                            }
                    ],
                    "headline-lg-mobile": [
                            "24px",
                            {
                                    "lineHeight": "1.2",
                                    "letterSpacing": "0.05em",
                                    "fontWeight": "700"
                            }
                    ],
                    "body-md": [
                            "16px",
                            {
                                    "lineHeight": "1.6",
                                    "fontWeight": "400"
                            }
                    ],
                    "headline-xl": [
                            "48px",
                            {
                                    "lineHeight": "1.1",
                                    "letterSpacing": "-0.02em",
                                    "fontWeight": "800"
                            }
                    ],
                    "headline-lg": [
                            "32px",
                            {
                                    "lineHeight": "1.2",
                                    "letterSpacing": "0.05em",
                                    "fontWeight": "700"
                            }
                    ],
                    "label-md": [
                            "13px",
                            {
                                    "lineHeight": "1.2",
                                    "letterSpacing": "0.02em",
                                    "fontWeight": "500"
                            }
                    ],
                    "body-lg": [
                            "18px",
                            {
                                    "lineHeight": "1.6",
                                    "fontWeight": "400"
                            }
                    ],
                    "headline-xl-mobile": [
                            "36px",
                            {
                                    "lineHeight": "1.1",
                                    "fontWeight": "800"
                            }
                    ],
                    "headline-md": [
                            "24px",
                            {
                                    "lineHeight": "1.2",
                                    "fontWeight": "700"
                            }
                    ]
            }
    },
        },
      }

module.exports.content = ['./index.html', './projects/*.html'];
module.exports.darkMode = 'class';
module.exports.plugins = [
  require('@tailwindcss/forms'),
  require('@tailwindcss/container-queries'),
];
