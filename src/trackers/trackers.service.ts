import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tracker } from '../entities/tracker.entity';

@Injectable()
export class TrackersService {
    constructor(
        @InjectRepository(Tracker)
        private readonly trackerRepository: Repository<Tracker>,
    ) { }

    async updateOfflineTrackers(): Promise<void> {

        const trackers = await this.trackerRepository.find();

        const now = new Date();

        for (const tracker of trackers) {

            // Never seen before
            if (!tracker.LastSeen) {

                tracker.IsOnline = false;

                await this.trackerRepository.save(tracker);

                continue;
            }

            // Difference in seconds
            const diffMs =
                now.getTime() -
                new Date(tracker.LastSeen).getTime();

            const diffSeconds = diffMs / 1000;

            // Offline after 60 sec
            if (diffSeconds > 60) {

                tracker.IsOnline = false;

                await this.trackerRepository.save(tracker);
            }
        }
    }
}
