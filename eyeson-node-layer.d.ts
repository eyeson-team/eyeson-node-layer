declare module "eyeson-node-layer" {
    export = EyesonLayer;
    /**
     * @typedef {'left'|'center'|'right'|'start'|'end'} TextAlign
     * @typedef {'top left'|'top center'|'top right'|'center left'|'center'|'center right'|'bottom left'|'bottom center'|'bottom right'} BoxOrigin
     */
    /**
     * Class Layer
     */
    class EyesonLayer {
        /**
         * @typedef {object} LayerObject
         * @prop {string} type
         *
         * @typedef {object} LayerOptions
         * @prop {boolean} [widescreen] - widescreen, default: true
         */
        /**
         * @param {LayerOptions} options
         */
        constructor(options?: {
            /**
             * - widescreen, default: true
             */
            widescreen?: boolean;
        });
        options: {
            /**
             * - widescreen, default: true
             */
            widescreen?: boolean;
        };
        /** @type {Array<LayerObject & Record<string,any>>} */
        _objects: ({
            type: string;
        } & Record<string, any>)[];
        /** @type {canvas.Canvas} */
        _canvas: canvas.Canvas;
        /** @type {canvas.SKRSContext2D} */
        _ctx: canvas.SKRSContext2D;
        /**
         * measure text
         * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/measureText
         * @param {string} text
         * @param {string} font - E.g. '16px Arial, sans-serif'
         * @returns {TextMetrics}
         */
        measureText(text: string, font: string): TextMetrics;
        /**
         * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createLinearGradient
         * @param {number} x1
         * @param {number} y1
         * @param {number} x2
         * @param {number} y2
         * @returns {CanvasGradient}
         */
        createLinearGradient(x1: number, y1: number, x2: number, y2: number): CanvasGradient;
        /**
         * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createRadialGradient
         * @param {number} x1
         * @param {number} y1
         * @param {number} r1
         * @param {number} x2
         * @param {number} y2
         * @param {number} r2
         * @returns {CanvasGradient}
         */
        createRadialGradient(x1: number, y1: number, r1: number, x2: number, y2: number, r2: number): CanvasGradient;
        /**
         * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createConicGradient
         * @param {number} startAngle
         * @param {number} x
         * @param {number} y
         * @returns {CanvasGradient}
         */
        createConicGradient(startAngle: number, x: number, y: number): CanvasGradient;
        /**
         * Set shadow that is applied to all following elements
         * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/shadowBlur
         * @param {number} blur
         * @param {number} offsetX
         * @param {number} offsetY
         * @param {string} color - CSS color value, e.g. '#000' or 'black' or with alpha 'rgb(0 0 0 / 10%)'
         * @returns {{ type: 'start-shadow', blur: number, offsetX: number, offsetY: number, color: string }}
         */
        startShadow(blur: number, offsetX: number, offsetY: number, color: string): {
            type: 'start-shadow';
            blur: number;
            offsetX: number;
            offsetY: number;
            color: string;
        };
        /**
         * End shadow, continue without shadow
         * @returns {{ type: 'end-shadow' }}
         */
        endShadow(): {
            type: 'end-shadow';
        };
        /**
         * add text to canvas
         * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillText
         * @param {string} text
         * @param {string} font - E.g. '16px Arial, sans-serif'
         * @param {string|CanvasGradient} color - CSS color value, e.g. '#000' or 'black' or with alpha 'rgb(0 0 0 / 10%)'
         * @param {number} x
         * @param {number} y
         * @param {number|null} [maxWidth]
         * @returns {{ type: 'text', text: string, font: string, color: string|CanvasGradient, x: number, y: number, maxWidth: number|null }}
         */
        addText(text: string, font: string, color: string | CanvasGradient, x: number, y: number, maxWidth?: number | null): {
            type: 'text';
            text: string;
            font: string;
            color: string | CanvasGradient;
            x: number;
            y: number;
            maxWidth: number | null;
        };
        /**
         * add multiline text to canvas
         * @param {string} text
         * @param {string} font - E.g. '16px Arial, sans-serif'
         * @param {string|CanvasGradient} color - CSS color value, e.g. '#000' or 'black' or with alpha 'rgb(0 0 0 / 10%)'
         * @param {number} x
         * @param {number} y
         * @param {number} width
         * @param {number} height
         * @param {number} lineHeight
         * @param {TextAlign} [textAlign]
         * @returns {{ type: 'multiline', text: string, font: string, color: string|CanvasGradient, x: number, y: number, width: number, height: number, lineHeight: number, textAlign: TextAlign }}
         */
        addMultilineText(text: string, font: string, color: string | CanvasGradient, x: number, y: number, width: number, height: number, lineHeight: number, textAlign?: TextAlign): {
            type: 'multiline';
            text: string;
            font: string;
            color: string | CanvasGradient;
            x: number;
            y: number;
            width: number;
            height: number;
            lineHeight: number;
            textAlign: TextAlign;
        };
        /**
         * add image to canvas
         * @param {string} path - URL or path of image file
         * @param {number} x
         * @param {number} y
         * @param {number|null} [width] - width of image if null
         * @param {number|null} [height] - height of image if null
         * @returns {Promise<{ type: 'image', image: canvas.Image, x: number, y: number, width: number|null, height: number|null }>}
         */
        addImage(path: string, x: number, y: number, width?: number | null, height?: number | null): Promise<{
            type: 'image';
            image: canvas.Image;
            x: number;
            y: number;
            width: number | null;
            height: number | null;
        }>;
        /**
         * add a filled rectangle to canvas
         * @param {number} x
         * @param {number} y
         * @param {number} width
         * @param {number} height
         * @param {number} radius - default 0
         * @param {string|CanvasGradient} color - CSS color value, e.g. '#000' or 'black' or with alpha 'rgb(0 0 0 / 10%)'
         * @returns {{ type: 'rect', x: number, y: number, width: number, height: number, radius: number, color: string|CanvasGradient }}
         */
        addRect(x: number, y: number, width: number, height: number, radius: number, color: string | CanvasGradient): {
            type: 'rect';
            x: number;
            y: number;
            width: number;
            height: number;
            radius: number;
            color: string | CanvasGradient;
        };
        /**
         * add a stroked rectangle to canvas
         * @param {number} x
         * @param {number} y
         * @param {number} width
         * @param {number} height
         * @param {number} lineWidth - default 1
         * @param {number} radius - default 0
         * @param {string|CanvasGradient} color - CSS color value, e.g. '#000' or 'black' or with alpha 'rgb(0 0 0 / 10%)'
         * @returns {{ type: 'rect-outline', x: number, y: number, width: number, height: number, lineWidth: number, radius: number, color: string|CanvasGradient }}
         */
        addRectOutline(x: number, y: number, width: number, height: number, lineWidth: number, radius: number, color: string | CanvasGradient): {
            type: 'rect-outline';
            x: number;
            y: number;
            width: number;
            height: number;
            lineWidth: number;
            radius: number;
            color: string | CanvasGradient;
        };
        /**
         * add a filled circle
         * @param {number} x
         * @param {number} y
         * @param {number} radius
         * @param {string|CanvasGradient} color - CSS color value, e.g. '#000' or 'black' or with alpha 'rgb(0 0 0 / 10%)'
         * @returns {{ type: 'circle', x: number, y: number, radius: number, color: string|CanvasGradient }}
         */
        addCircle(x: number, y: number, radius: number, color: string | CanvasGradient): {
            type: 'circle';
            x: number;
            y: number;
            radius: number;
            color: string | CanvasGradient;
        };
        /**
         * add a stroked circle
         * @param {number} x
         * @param {number} y
         * @param {number} radius
         * @param {number} lineWidth - default 1
         * @param {string|CanvasGradient} color - CSS color value, e.g. '#000' or 'black' or with alpha 'rgb(0 0 0 / 10%)'
         * @returns {{ type: 'circle-outline', x: number, y: number, radius: number, lineWidth: number, color: string|CanvasGradient }}
         */
        addCircleOutline(x: number, y: number, radius: number, lineWidth: number, color: string | CanvasGradient): {
            type: 'circle-outline';
            x: number;
            y: number;
            radius: number;
            lineWidth: number;
            color: string | CanvasGradient;
        };
        /**
         * add a line
         * @param {number} x1
         * @param {number} y1
         * @param {number} x2
         * @param {number} y2
         * @param {number} lineWidth - default 1
         * @param {string|CanvasGradient} color - CSS color value, e.g. '#000' or 'black' or with alpha 'rgb(0 0 0 / 10%)'
         * @returns {{ type: 'line', x1: number, y1: number, x2: number, y2: number, lineWidth: number, color: string|CanvasGradient }}
         */
        addLine(x1: number, y1: number, x2: number, y2: number, lineWidth: number, color: string | CanvasGradient): {
            type: 'line';
            x1: number;
            y1: number;
            x2: number;
            y2: number;
            lineWidth: number;
            color: string | CanvasGradient;
        };
        /**
         * add a filled polygon
         * @param {string|CanvasGradient} color - CSS color value, e.g. '#000' or 'black' or with alpha 'rgb(0 0 0 / 10%)'
         * @param  {...number} points - a sequence of x, y point coordinates. minimum 3 points
         * @returns {{ type: 'polygon', color: string|CanvasGradient, points: Array<number> }}
         */
        addPolygon(color: string | CanvasGradient, ...points: number[]): {
            type: 'polygon';
            color: string | CanvasGradient;
            points: Array<number>;
        };
        /**
         * add a stroked polygon
         * @param {string|CanvasGradient} color - CSS color value, e.g. '#000' or 'black' or with alpha 'rgb(0 0 0 / 10%)'
         * @param {number} lineWidth - default 1
         * @param  {...number} points - a sequence of x, y point coordinates. minimum 3 points
         * @returns {{ type: 'polygon-outline', color: string|CanvasGradient, lineWidth: number, points: Array<number> }}
         */
        addPolygonOutline(color: string | CanvasGradient, lineWidth?: number, ...points: number[]): {
            type: 'polygon-outline';
            color: string | CanvasGradient;
            lineWidth: number;
            points: Array<number>;
        };
        /**
         * add a text on a filled box
         * @param {string} text
         * @param {string} font - E.g. '16px Arial, sans-serif'
         * @param {string|CanvasGradient} fontColor - CSS color value, e.g. '#000' or 'black' or with alpha 'rgb(0 0 0 / 10%)'
         * @param {number} x
         * @param {number} y
         * @param {BoxOrigin} origin - Origin of x, y, default "top left"
         * @param {number|Array<number>} padding - One number for all sides or array of numbers, supports 1, 2, 3, or 4 value notation. default 0
         * @param {number|null} maxWidth - default null
         * @param {number} radius - default 0
         * @param {string|CanvasGradient} color - CSS color value, e.g. '#000' or 'black' or with alpha 'rgb(0 0 0 / 10%)'
         * @returns {{ type: 'text-box', text: string, font: string, fontColor: string|CanvasGradient, x: number, y: number, origin: BoxOrigin, padding: number|Array<number>, maxWidth: number|null, radius: number, color: string|CanvasGradient }}
         */
        addTextBox(text: string, font: string, fontColor: string | CanvasGradient, x: number, y: number, origin: BoxOrigin, padding: number | Array<number>, maxWidth: number | null, radius: number, color: string | CanvasGradient): {
            type: 'text-box';
            text: string;
            font: string;
            fontColor: string | CanvasGradient;
            x: number;
            y: number;
            origin: BoxOrigin;
            padding: number | Array<number>;
            maxWidth: number | null;
            radius: number;
            color: string | CanvasGradient;
        };
        /**
         * add a text on a stroked box
         * @param {string} text
         * @param {string} font - E.g. '16px Arial, sans-serif'
         * @param {string|CanvasGradient} fontColor - CSS color value, e.g. '#000' or 'black' or with alpha 'rgb(0 0 0 / 10%)'
         * @param {number} x
         * @param {number} y
         * @param {BoxOrigin} origin - Origin of x, y, default "top left"
         * @param {number|Array<number>} padding - One number for all sides or array of numbers, supports 1, 2, 3, or 4 value notation. default 0
         * @param {number|null} maxWidth - default null
         * @param {number} radius - default 0
         * @param {number} lineWidth - default 1
         * @param {string|CanvasGradient} color - CSS color value, e.g. '#000' or 'black' or with alpha 'rgb(0 0 0 / 10%)'
         * @returns {{ type: 'text-box-outline', text: string, font: string, fontColor: string|CanvasGradient, x: number, y: number, origin: BoxOrigin, padding: number|Array<number>, maxWidth: number|null, radius: number, lineWidth: number, color: string|CanvasGradient }}
         */
        addTextBoxOutline(text: string, font: string, fontColor: string | CanvasGradient, x: number, y: number, origin: BoxOrigin, padding: number | Array<number>, maxWidth: number | null, radius: number, lineWidth: number, color: string | CanvasGradient): {
            type: 'text-box-outline';
            text: string;
            font: string;
            fontColor: string | CanvasGradient;
            x: number;
            y: number;
            origin: BoxOrigin;
            padding: number | Array<number>;
            maxWidth: number | null;
            radius: number;
            lineWidth: number;
            color: string | CanvasGradient;
        };
        /**
         * add a filled rectangle with non-exeeding multiline text
         * @param {string} text
         * @param {string} font - E.g. '16px Arial, sans-serif'
         * @param {string|CanvasGradient} fontColor - CSS color value, e.g. '#000' or 'black' or with alpha 'rgb(0 0 0 / 10%)'
         * @param {number} x
         * @param {number} y
         * @param {number} width
         * @param {number} height
         * @param {number|Array<number>} padding - One number for all sides or array of numbers, supports 1, 2, 3, or 4 value notation. default 0
         * @param {number} lineHeight
         * @param {number} radius - default 0
         * @param {string|CanvasGradient} color - CSS color value, e.g. '#000' or 'black' or with alpha 'rgb(0 0 0 / 10%)'
         * @param {TextAlign} [textAlign] - default "left"
         * @returns {{ type: 'multiline-box', text: string, font: string, fontColor: string|CanvasGradient, x: number, y: number, width: number, height: number, padding: number|Array<number>, lineHeight: number, radius: number, color: string|CanvasGradient, textAlign: TextAlign }}
         */
        addMultilineTextBox(text: string, font: string, fontColor: string | CanvasGradient, x: number, y: number, width: number, height: number, padding: number | Array<number>, lineHeight: number, radius: number, color: string | CanvasGradient, textAlign?: TextAlign): {
            type: 'multiline-box';
            text: string;
            font: string;
            fontColor: string | CanvasGradient;
            x: number;
            y: number;
            width: number;
            height: number;
            padding: number | Array<number>;
            lineHeight: number;
            radius: number;
            color: string | CanvasGradient;
            textAlign: TextAlign;
        };
        /**
         * add a stroked rectangle with non-exeeding multiline text
         * @param {string} text
         * @param {string} font - E.g. '16px Arial, sans-serif'
         * @param {string|CanvasGradient} fontColor - CSS color value, e.g. '#000' or 'black' or with alpha 'rgb(0 0 0 / 10%)'
         * @param {number} x
         * @param {number} y
         * @param {number} width
         * @param {number} height
         * @param {number|Array<number>} padding - One number for all sides or array of numbers, supports 1, 2, 3, or 4 value notation. default 0
         * @param {number} lineHeight
         * @param {number} radius - default 0
         * @param {number} lineWidth - default 1
         * @param {string|CanvasGradient} color - CSS color value, e.g. '#000' or 'black' or with alpha 'rgb(0 0 0 / 10%)'
         * @param {TextAlign} [textAlign] - default "left"
         * @returns {{ type: 'multiline-box-outline', text: string, font: string, fontColor: string|CanvasGradient, x: number, y: number, width: number, height: number, padding: number|Array<number>, lineHeight: number, radius: number, lineWidth: number, color: string|CanvasGradient, textAlign: TextAlign }}
         */
        addMultilineTextBoxOutline(text: string, font: string, fontColor: string | CanvasGradient, x: number, y: number, width: number, height: number, padding: number | Array<number>, lineHeight: number, radius: number, lineWidth: number, color: string | CanvasGradient, textAlign?: TextAlign): {
            type: 'multiline-box-outline';
            text: string;
            font: string;
            fontColor: string | CanvasGradient;
            x: number;
            y: number;
            width: number;
            height: number;
            padding: number | Array<number>;
            lineHeight: number;
            radius: number;
            lineWidth: number;
            color: string | CanvasGradient;
            textAlign: TextAlign;
        };
        /**
         * Draw on canvas and return Buffer
         * @returns {Buffer}
         */
        createBuffer(): Buffer;
        /**
         * Write canvas to image file for testing
         * @param {string} path - write file destination path
         * @returns {Promise}
         */
        writeFile(path: string): Promise<any>;
    }
    namespace EyesonLayer {
        export { registerFont, TextAlign, BoxOrigin };
    }
    import canvas = require("@napi-rs/canvas");
    /**
     * Register font by file path and font name
     * @param {string} path - path to font file
     * @param {string} name - name of font
     * @returns {boolean}
     */
    function registerFont(path: string, name: string): boolean;
    type TextAlign = 'left' | 'center' | 'right' | 'start' | 'end';
    type BoxOrigin = 'top left' | 'top center' | 'top right' | 'center left' | 'center' | 'center right' | 'bottom left' | 'bottom center' | 'bottom right';
}
