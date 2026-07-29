import {useQuery} from '@tanstack/react-query';
import {useApiClient} from './useApiClient';
import {DEV_BYPASS_AUTH, MOCK_GAMIFICATION} from '@/lib/devFlags';
import type {Gamification} from '@/lib/types';

export const gamificationQueryKey = ['gamification'] as const;

export function useGamification(){
    const api = useApiClient();
    return useQuery({
        queryKey: gamificationQueryKey,
        queryFn: DEV_BYPASS_AUTH ? async () => MOCK_GAMIFICATION : () => api.get<Gamification>('/gamification/me/'),
        staleTime: 0,
        //we need this stale time override because app/_layout sets global 1-hour stale time, and without this 0, the streak would freeze for 1 hour after first load. 
    });
}


