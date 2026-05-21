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
   * @returns 
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
   * @returns 
   */
  async findAll(): Promise<Tracker[]> 
  {
    return this.trackerRepository.find();
  }

  /**
   * Finds a specific tracker by ID.
   * @param trackerId 
   * @returns 
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
   * @returns 
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
   * @returns 
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
   * @returns 
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