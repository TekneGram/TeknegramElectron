import type { ComponentType } from 'react';
import BubbleLayerMetadata from '../layers/BubbleLayerMetadata';
import type { BubbleLayerDataMap } from '../types/bubbleLayers';
import type { BubbleLayerType } from "./../types/bubble"
import { fetchBubbleLayerMetadata } from '../services/bubbleLayerMetadata.service';

type RegistryEntry<T extends BubbleLayerType> = {
    component: ComponentType<{ data: BubbleLayerDataMap[T] }>;
    fetcher: (dataId: string) => Promise<BubbleLayerDataMap[T]>;
};

export const bubbleRegistry: {
    [Key in BubbleLayerType]: RegistryEntry<Key>
} = {
    corpusMetadata: {
        component: BubbleLayerMetadata,
        fetcher: fetchBubbleLayerMetadata
    },
    corpusSampler: {
        component: BubbleLayerMetadata,
        fetcher: fetchBubbleLayerMetadata
    },
    lbExtraction: {
        component: BubbleLayerMetadata,
        fetcher: fetchBubbleLayerMetadata
    },
    lbAnalysis: {
        component: BubbleLayerMetadata,
        fetcher: fetchBubbleLayerMetadata
    }
}