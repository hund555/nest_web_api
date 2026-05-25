import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tracker } from '../entities/tracker.entity';
import { CreateTrackerDto, UpdateTrackerDto } from '../dto/tracker.dto';

@Injectable()
export class TrackersService {
  constructor(
    @InjectRepository(Tracker)
    private readonly trackerRepository: Repository<Tracker>,
  ) {}

  /**
   * Creates a new tracker.
   * @param dto 
   * @returns A promise resolving to the created Tracker entity.
   */
  async create(dto: CreateTrackerDto): Promise<Tracker> 
  {
    const tracker = this.trackerRepository.create({
      ...dto,
      IsOnline: false,
    });
    return this.trackerRepository.save(tracker);
  }

  /**
   * Finds all trackers.
   * @returns A promise resolving to an array of Tracker entities.
   */
  async findAll(): Promise<Tracker[]> 
  {
    return this.trackerRepository.find();
  }

  /**
   * Finds a specific tracker by ID.
   * @param trackerId 
   * @returns A promise resolving to a Tracker entity or null if not found.
   */
  async findOne(trackerId: number): Promise<Tracker | null> 
  {
    return this.trackerRepository.findOne({
      where: { Tracker_ID: trackerId },
    });
  }

  /**
   * Updates a tracker by ID.
   * @param trackerId 
   * @param dto 
   * @returns A promise resolving to the updated Tracker entity or null if not found.
   */
  async update(trackerId: number, dto: UpdateTrackerDto): Promise<Tracker | null> 
  {
    await this.trackerRepository.update(trackerId, dto);
    return this.findOne(trackerId);
  }

  /**
   * Sets the online status of a tracker, typically called when a tracker connects or disconnects.
   * @param trackerId 
   * @param isOnline 
   * @returns A promise resolving to the updated Tracker entity or null if not found.
   */
  async setOnlineStatus(trackerId: number, isOnline: boolean): Promise<Tracker | null> 
  {
    await this.trackerRepository.update(trackerId, { IsOnline: isOnline });
    return this.findOne(trackerId);
  }

  /**
   * Updates the battery level of a tracker, typically called when a tracker reports its battery status.
   * @param trackerId 
   * @param battery 
   * @returns A promise resolving to the updated Tracker entity or null if not found.
   */
  async updateBattery(trackerId: number, battery: number): Promise<Tracker | null> 
  {
    await this.trackerRepository.update(trackerId, { Battery: battery });
    return this.findOne(trackerId);
  }

  /**
   * Removes a tracker by ID.
   * @param trackerId 
   */
  async remove(trackerId: number): Promise<void> 
  {
    await this.trackerRepository.delete(trackerId);
  }
}