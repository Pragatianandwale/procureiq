from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
import pytz
import asyncio
import requests
from datetime import datetime
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ProcureIQScheduler:
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self.ist_tz = pytz.timezone('Asia/Kolkata')
        self.api_base_url = "http://localhost:8000"
        
    def start(self):
        """Start the scheduler"""
        # Schedule daily pipeline run at 5:00 AM IST
        self.scheduler.add_job(
            func=self.run_daily_pipeline,
            trigger=CronTrigger(
                hour=5,
                minute=0,
                timezone=self.ist_tz
            ),
            id='daily_pipeline',
            name='Daily Pipeline Execution',
            replace_existing=True
        )
        
        # Schedule pipeline completion check at 6:00 AM IST
        self.scheduler.add_job(
            func=self.check_pipeline_completion,
            trigger=CronTrigger(
                hour=6,
                minute=0,
                timezone=self.ist_tz
            ),
            id='pipeline_check',
            name='Pipeline Completion Check',
            replace_existing=True
        )
        
        self.scheduler.start()
        logger.info("ProcureIQ Scheduler started - Daily pipeline at 5:00 AM IST")
    
    async def run_daily_pipeline(self):
        """Run the daily pipeline at 5:00 AM IST"""
        try:
            current_time = datetime.now(self.ist_tz)
            logger.info(f"Starting daily pipeline at {current_time.strftime('%I:%M %p IST')}")
            
            # Call the pipeline API
            response = requests.post(f"{self.api_base_url}/api/pipeline/run", timeout=300)
            
            if response.status_code == 200:
                result = response.json()
                logger.info(f"Pipeline completed successfully. Recommendation: {result.get('recommendation', 'Unknown')}")
                
                # Log completion time
                completion_time = datetime.now(self.ist_tz)
                duration = (completion_time - current_time).total_seconds()
                
                if completion_time.hour >= 6:
                    logger.warning(f"Pipeline completed late at {completion_time.strftime('%I:%M %p IST')} (after 6:00 AM)")
                else:
                    logger.info(f"Pipeline completed on time in {duration:.1f} seconds")
                
            else:
                logger.error(f"Pipeline failed with status {response.status_code}: {response.text}")
                
        except requests.exceptions.Timeout:
            logger.error("Pipeline execution timed out (5 minutes)")
        except Exception as e:
            logger.error(f"Error running daily pipeline: {e}")
    
    async def check_pipeline_completion(self):
        """Check if pipeline completed before 6:00 AM IST"""
        try:
            current_time = datetime.now(self.ist_tz)
            logger.info(f"Checking pipeline completion at {current_time.strftime('%I:%M %p IST')}")
            
            # Get latest recommendation
            response = requests.get(f"{self.api_base_url}/api/recommendation/latest")
            
            if response.status_code == 200:
                result = response.json()
                generated_at = result.get('generated_at', '')
                
                if generated_at:
                    # Check if recommendation was generated today
                    today = current_time.strftime('%Y-%m-%d')
                    if today in result.get('generated_timestamp', ''):
                        logger.info("Pipeline completed successfully before market open")
                    else:
                        logger.warning("No recommendation generated today - pipeline may have failed")
                else:
                    logger.warning("No recent recommendation found")
            else:
                logger.error("Could not check pipeline completion status")
                
        except Exception as e:
            logger.error(f"Error checking pipeline completion: {e}")
    
    def stop(self):
        """Stop the scheduler"""
        self.scheduler.shutdown()
        logger.info("ProcureIQ Scheduler stopped")
    
    def get_next_run_time(self):
        """Get next scheduled run time"""
        job = self.scheduler.get_job('daily_pipeline')
        if job:
            return job.next_run_time
        return None
    
    def trigger_manual_run(self):
        """Trigger manual pipeline run"""
        try:
            # Schedule immediate run
            self.scheduler.add_job(
                func=self.run_daily_pipeline,
                trigger='date',
                run_date=datetime.now(self.ist_tz),
                id='manual_pipeline',
                name='Manual Pipeline Run',
                replace_existing=True
            )
            logger.info("Manual pipeline run scheduled")
            return True
        except Exception as e:
            logger.error(f"Error scheduling manual run: {e}")
            return False

# Global scheduler instance
scheduler_instance = None

def start_scheduler():
    """Start the global scheduler instance"""
    global scheduler_instance
    if scheduler_instance is None:
        scheduler_instance = ProcureIQScheduler()
        scheduler_instance.start()
    return scheduler_instance

def stop_scheduler():
    """Stop the global scheduler instance"""
    global scheduler_instance
    if scheduler_instance:
        scheduler_instance.stop()
        scheduler_instance = None

async def main():
    """Main function for running scheduler standalone"""
    scheduler = start_scheduler()
    
    try:
        # Keep the scheduler running
        while True:
            await asyncio.sleep(60)  # Check every minute
            
    except KeyboardInterrupt:
        logger.info("Received interrupt signal")
    finally:
        stop_scheduler()

if __name__ == "__main__":
    asyncio.run(main())