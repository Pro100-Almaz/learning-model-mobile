import {useFreshQuery} from './useFreshQuery';
import {useApiClient} from './useApiClient';
import {DEV_BYPASS_AUTH, MOCK_GAMIFICATION} from '@/lib/devFlags';
import type {Gamification} from '@/lib/types';

export const gamificationQueryKey = ['gamification'] as const;

// Home and Profile render the streak from this one query key, so whichever
// screen refetches, both re-render with the same number — they can't drift
// apart. Keeping them *current* is useFreshQuery's job: tab screens mount once
// per session and then stay mounted, so the refetch-on-focus it adds is what
// picks up the streak a just-finished test awarded.
export function useGamification(){
    const api = useApiClient();
    return useFreshQuery({
        queryKey: gamificationQueryKey,
        queryFn: DEV_BYPASS_AUTH ? async () => MOCK_GAMIFICATION : () => api.get<Gamification>('/gamification/me/'),
    });
}
