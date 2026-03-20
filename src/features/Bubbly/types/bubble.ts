export type BubbleLayerType = 
    | 'corpusMetadata';

export interface BubbleRecord {
    bubbleId: string;
    layerType: BubbleLayerType;
    title: string;
    order: number;
}