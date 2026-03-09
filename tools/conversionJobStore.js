const jobs = new Map();

const createJob = (type) => {
  const id = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const job = {
    id,
    type,
    status: 'queued',
    progress: 0,
    stage: 'Queued',
    result: null,
    error: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  jobs.set(id, job);
  return job;
};

const updateJob = (id, patch) => {
  const current = jobs.get(id);
  if (!current) return null;
  const updated = { ...current, ...patch, updatedAt: new Date().toISOString() };
  jobs.set(id, updated);
  return updated;
};

const getJob = (id) => jobs.get(id) || null;

module.exports = {
  createJob,
  updateJob,
  getJob
};
