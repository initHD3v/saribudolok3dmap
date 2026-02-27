declare module '@mapbox/mapbox-gl-draw' {
    import { IControl, Map } from 'maplibre-gl';

    export default class MapboxDraw implements IControl {
        constructor(options?: any);
        onAdd(map: Map): HTMLElement;
        onRemove(map: Map): void;
        add(geojson: any): string[];
        get(featureId: string): any;
        getAll(): any;
        delete(featureIds: string | string[]): this;
        deleteAll(): this;
        set(geojson: any): string[];
        has(featureId: string): boolean;
        getSelectedIds(): string[];
        getSelected(): any;
        getSelectedPoints(): any;
        setFeatureProperty(featureId: string, property: string, value: any): this;
        getFeatureProperty(featureId: string, property: string): any;
        changeMode(mode: string, options?: any): this;
        getMode(): string;
        trash(): this;
        combineFeatures(): this;
        uncombineFeatures(): this;
    }
}
