-- Add route optimization fields to assignments table
ALTER TABLE public.assignments 
ADD COLUMN IF NOT EXISTS route_order INTEGER,
ADD COLUMN IF NOT EXISTS cluster_id INTEGER,
ADD COLUMN IF NOT EXISTS optimized_at TIMESTAMP WITH TIME ZONE;

-- Add index for better query performance on route order
CREATE INDEX IF NOT EXISTS idx_assignments_route_order 
ON public.assignments(employee_id, route_order) 
WHERE status IN ('pending', 'assigned');

-- Add index for cluster-based queries
CREATE INDEX IF NOT EXISTS idx_assignments_cluster 
ON public.assignments(cluster_id, employee_id);

-- Add comment explaining the fields
COMMENT ON COLUMN public.assignments.route_order IS 'Sequential order for route optimization (1 = first stop, 2 = second, etc.)';
COMMENT ON COLUMN public.assignments.cluster_id IS 'Cluster identifier for grouped routes in same geographic area';
COMMENT ON COLUMN public.assignments.optimized_at IS 'Timestamp when route optimization was last applied';