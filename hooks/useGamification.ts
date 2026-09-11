import {useCallback} from 'react';
import {useQuery} from '@tanstack/react-query';
import {useFocusEffect} from 'expo-router';
import {useApiClient} from './useApiClient';
import {DEV_BYPASS_AUTH, MOCK_GAMIFICATION} from '@/lib/devFlags';
import type {Gamification} from '@/lib/types';

export const gamificationQueryKey = ['gamification'] as const;

export function useGamification(){
    const api = useApiClient();
    const query = useQuery({
        queryKey: gamificationQueryKey,
        queryFn: DEV_BYPASS_AUTH ? async () => MOCK_GAMIFICATION : () => api.get<Gamification>('/gamification/me/'),
        staleTime: 0,
        //we need this stale time override because app/_layout sets global 1-hour stale time, and without this 0, the streak would freeze for 1 hour after first load.
    });

    // Home and Profile render the streak from this one cache entry, so whichever
    // screen refetches, both re-render with the same number — they can't drift
    // apart. What they *can* do is go stale together: `staleTime: 0` only forces
    // a fetch when a new observer mounts, and tab screens mount once per session
    // and then stay mounted forever. Refetching on focus is what actually keeps
    // the streak current after a test awards one.
    const {refetch} = query;
    useFocusEffect(
        useCallback(() => {
            void refetch();
        }, [refetch])
    );

    return query;
}


