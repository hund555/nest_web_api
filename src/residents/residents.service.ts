import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resident } from '../entities/resident.entity';
import { CreateResidentDto, UpdateResidentDto } from '../dto/resident.dto';
import { TrackersService } from '../trackers/trackers.service';

@Injectable()
export class ResidentsService {
  constructor(
    @InjectRepository(Resident)
    private readonly residentRepository: Repository<Resident>,
    private readonly trackersService: TrackersService,
  ) {}

  async create(dto: CreateResidentDto): Promise<Resident> 
  {
    if (dto.Tracker_ID) 
    {
      const tracker = await this.trackersService.findOne(dto.Tracker_ID);
      if (!tracker) 
      {
        throw new BadRequestException(`Tracker with ID ${dto.Tracker_ID} does not exist`);
      }
    }

    const resident = this.residentRepository.create({
      ...dto,
      tracker: dto.Tracker_ID ? { Tracker_ID: dto.Tracker_ID } : undefined,
    });
    return this.residentRepository.save(resident);
  }

  async findAll(): Promise<Resident[]> 
  {
    return this.residentRepository.find({
      relations: ['tracker'],
    });
  }

  async findOne(residentId: number): Promise<Resident | null> 
  {
    return this.residentRepository.findOne({
      where: { Resident_ID: residentId },
      relations: ['tracker'],
    });
  }

  async update(residentId: number, dto: UpdateResidentDto): Promise<Resident | null> 
  {
    await this.residentRepository.update(residentId, {
      ...dto,
      tracker: dto.Tracker_ID ? { Tracker_ID: dto.Tracker_ID } : undefined,
    });
    return this.findOne(residentId);
  }

  async remove(residentId: number): Promise<void> 
  {
    await this.residentRepository.delete(residentId);
  }

  async findByTracker(trackerId: number): Promise<Resident | null> 
  {
    return this.residentRepository.findOne({
      where: { tracker: { Tracker_ID: trackerId } },
      relations: ['tracker'],
    });
  }
}