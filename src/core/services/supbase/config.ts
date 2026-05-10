import { NODE_ENV, NodeEnv } from '@/types';
import { createClient } from '@supabase/supabase-js';

const isSelfHosted = NODE_ENV === NodeEnv.SELF_HOSTED;
// Create a mock client for self-hosted mode
const createMockClient = () => {
	return {
		auth: {
			signIn: async () => ({ user: null, error: null }),
			signOut: async () => ({ error: null }),
			onAuthStateChange: () => ({ data: null, error: null }),
			getSession: async () => ({ data: null, error: null }),
		},
		from: () => ({
			select: async () => [],
			insert: async () => ({ data: null, error: null }),
			update: async () => ({ data: null, error: null }),
			delete: async () => ({ data: null, error: null }),
		}),
	};
};

// Use real Supabase client only if not in self-hosted mode AND credentials are configured.
// When the env vars are missing (e.g. Storybook static deploys, CI builds, contributor onboarding),
// fall back to the same mock client used in self-hosted mode rather than crashing on import.
const supabaseUrl = isSelfHosted ? '' : import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = isSelfHosted ? '' : import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const useMockClient = isSelfHosted || !supabaseUrl || !supabaseKey;

const supabase = useMockClient ? (createMockClient() as any) : createClient(supabaseUrl, supabaseKey);

export default supabase;
