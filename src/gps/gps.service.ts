import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GpsLocation } from '../entities/gps.entity';
import { Tracker } from '../entities/tracker.entity';

export class GpsLocationDto {
  Tracker_ID: number;
  lat: number;
  lng: number;
}

@Injectable()
export class GpsService {
  constructor(
    @InjectRepository(GpsLocation)
    private readonly gpsRepository: Repository<GpsLocation>,
    @InjectRepository(Tracker)
    private readonly trackerRepository: Repository<Tracker>,
  ) { }

  /**
   * Persists a new GPS location for the specified tracker.
   *
   * Finds the tracker by DTO. If the tracker exists, marks it online,
   * updates its last seen timestamp, and saves the incoming latitude/longitude.
   *
   * @param dto GPS payload containing tracker ID, latitude and longitude
   * @returns the saved GpsLocation entity
   */
  async saveLocation(dto: GpsLocationDto): Promise<GpsLocation> {

    // Find tracker
    const tracker = await this.trackerRepository.findOne({
      where: {
        Tracker_ID: dto.Tracker_ID
      }
    });

    if (!tracker) {
      throw new Error('Tracker not found');
    }

    // Tracker is online because GPS data arrived
    tracker.IsOnline = true;
    tracker.LastSeen = new Date();

    await this.trackerRepository.save(tracker);

    // Save GPS location
    const location = this.gpsRepository.create({
      tracker,
      lat: dto.lat,
      lng: dto.lng,
    });

    return this.gpsRepository.save(location);
  }

  /**
   * Retrieves the latest GPS location for a given tracker ID.
   * @param trackerId 
   * @returns 
   */
  async getLatestByTracker(trackerId: number): Promise<GpsLocation | null> {
    return this.gpsRepository.findOne({
      where: { tracker: { Tracker_ID: trackerId } },
      order: { Timestamp: 'DESC' },
      relations: ['tracker'],
    });
  }

  /**
   * Retrieves the 5 latest GPS locations for a given tracker ID.
   * @param trackerId 
   * @returns 
   */
  async get5LatestsByTracker(trackerId: number): Promise<GpsLocation[]> {
    return this.gpsRepository.find({
      where: { tracker: { Tracker_ID: trackerId } },
      order: { Timestamp: 'DESC' },
      take: 5,
      relations: ['tracker'],
    });
  }
}