
class JobInfo<Job, JobResult> {

    public promise: Promise<JobResult>
    public resolve: (value: JobResult) => void
    public reject: (error: any) => void
    
    constructor(public job: Job) {
        this.promise = new Promise<JobResult>((resolve, reject) => {
            this.resolve = resolve
            this.reject = reject
        })
    }

}


/**
 * A queue of jobs to execute serially (only one job at a time).
 * Ensuring a shared is not accessed in parallel.
 */
export default class SerialJobQueue<Job, JobResult> {

    private jobQueue: JobInfo<Job, JobResult>[] = []
    private isJobRunning = false


    constructor(private combineJobs: (newJob: Job, existingJob: Job) => Job | null, private processJob: (job: Job) => Promise<JobResult>) {
    }


    addJob(job: Job): Promise<JobResult> {
        for (const jobInfo of this.jobQueue) {
            const combinedJob = this.combineJobs(job, jobInfo.job)
            if (combinedJob !== null) {
                // We can combine these jobs
                // => Update job info and share the promise
                jobInfo.job = combinedJob
                return jobInfo.promise
            }
        }
    
        const jobInfo = new JobInfo<Job, JobResult>(job)
        this.jobQueue.push(jobInfo)
        this.checkQueue()
    
        return jobInfo.promise
    }


    private checkQueue() {
        if (this.isJobRunning) {
            return
        }
    
        const nextJobInfo = this.jobQueue.shift()
        if (!nextJobInfo) {
            return
        }
    
        this.isJobRunning = true
        this.processJob(nextJobInfo.job)
            .then(
                thumbailData => nextJobInfo.resolve(thumbailData),
                error => nextJobInfo.reject(error))
            .then(() => {
                this.isJobRunning = false
                this.checkQueue()
            })
    }
    
}
