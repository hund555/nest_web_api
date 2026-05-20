import { Test, TestingModule } from '@nestjs/testing';
import { GpsController } from './gps.controller';
import { GpsService } from './gps.service';

const mockGpsService = {
  getLatestByTracker: jest.fn(),
  getAllByTracker: jest.fn(),
  get5LatestsByTracker: jest.fn(),
};

describe('GpsController', () => {
  let controller: GpsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GpsController],
      providers: [{ provide: GpsService, useValue: mockGpsService }],
    }).compile();

    controller = module.get<GpsController>(GpsController);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getLatest', () => {
    it('should return the latest location for a tracker', async () => {
      const location = { ID: 1, tracker: { Tracker_ID: 1 }, lat: 55.123, lng: 9.456 };
      mockGpsService.getLatestByTracker.mockResolvedValue(location);

      const result = await controller.getLatest(1);

      expect(mockGpsService.getLatestByTracker).toHaveBeenCalledWith(1);
      expect(result).toEqual(location);
    });

    it('should return null if no location found', async () => {
      mockGpsService.getLatestByTracker.mockResolvedValue(null);

      const result = await controller.getLatest(999);

      expect(mockGpsService.getLatestByTracker).toHaveBeenCalledWith(999);
      expect(result).toBeNull();
    });
  });

  describe('getLatest5', () => {
    it('should return the 5 latest locations for a tracker', async () => {
      const locations = Array.from({ length: 5 }, (_, i) => ({
        ID: i + 1,
        tracker: { Tracker_ID: 1 },
        lat: 55.123 + i,
        lng: 9.456 + i,
      }));
      mockGpsService.get5LatestsByTracker.mockResolvedValue(locations);

      const result = await controller.getLatest5(1);

      expect(mockGpsService.get5LatestsByTracker).toHaveBeenCalledWith(1);
      expect(result).toHaveLength(5);
      expect(result).toEqual(locations);
    });
  });
});