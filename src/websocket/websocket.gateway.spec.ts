import { Test, TestingModule } from '@nestjs/testing';
import { WebsocketGateway } from './websocket.gateway';
import { GpsService } from '../gps/gps.service';
import { TrackersService } from '../trackers/trackers.service';
import { Logger } from '@nestjs/common';

const mockGpsService = {
  saveLocation: jest.fn(),
};

const mockTrackersService = {
  create: jest.fn(),
  findOne: jest.fn(),
  setOnlineStatus: jest.fn(),
  updateBattery: jest.fn(),
};

const mockClient = {
  send: jest.fn(),
  trackerId: null as number | null,
};

describe('WebsocketGateway', () => {
  let gateway: WebsocketGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebsocketGateway,
        Logger,
        { provide: GpsService, useValue: mockGpsService },
        { provide: TrackersService, useValue: mockTrackersService },
      ],
    }).compile();

    gateway = module.get<WebsocketGateway>(WebsocketGateway);
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockClient.trackerId = null;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should send welcome message on connection', () => {
      gateway.handleConnection(mockClient as any);

      expect(mockClient.send).toHaveBeenCalledWith(
        JSON.stringify({ event: 'connected', data: 'Welcome!' }),
      );
    });
  });

  describe('handleDisconnect', () => {
    it('should set tracker offline if client was identified', async () => {
      mockClient.trackerId = 1;
      mockTrackersService.setOnlineStatus.mockResolvedValue(undefined);

      await gateway.handleDisconnect(mockClient as any);

      expect(mockTrackersService.setOnlineStatus).toHaveBeenCalledWith(1, false);
    });

    it('should not call setOnlineStatus if client was not identified', async () => {
      mockClient.trackerId = null;

      await gateway.handleDisconnect(mockClient as any);

      expect(mockTrackersService.setOnlineStatus).not.toHaveBeenCalled();
    });
  });

  describe('handleRegister', () => {
    it('should create tracker, set online and send back the tracker ID', async () => {
      const payload = { IP: '192.168.1.1', Port: 8000 };
      const tracker = { Tracker_ID: 1, IP: '192.168.1.1', Port: 8000, IsOnline: false, Battery: null };

      mockTrackersService.create.mockResolvedValue(tracker);
      mockTrackersService.setOnlineStatus.mockResolvedValue(undefined);

      await gateway.handleRegister(mockClient as any, payload);

      expect(mockTrackersService.create).toHaveBeenCalledWith({ IP: payload.IP, Port: payload.Port });
      expect(mockTrackersService.setOnlineStatus).toHaveBeenCalledWith(1, true);
      expect(mockClient.send).toHaveBeenCalledWith(
        JSON.stringify({ event: 'registered', data: { Tracker_ID: 1 } }),
      );
      expect((mockClient as any).trackerId).toBe(1);
    });
  });

  describe('handleIdentify', () => {
    it('should set tracker online and confirm identification', async () => {
      const payload = { Tracker_ID: 1 };
      const tracker = { Tracker_ID: 1, IP: '192.168.1.1', Port: 8000, IsOnline: false, Battery: 80 };

      mockTrackersService.findOne.mockResolvedValue(tracker);
      mockTrackersService.setOnlineStatus.mockResolvedValue(undefined);

      await gateway.handleIdentify(mockClient as any, payload);

      expect(mockTrackersService.findOne).toHaveBeenCalledWith(1);
      expect(mockTrackersService.setOnlineStatus).toHaveBeenCalledWith(1, true);
      expect(mockClient.send).toHaveBeenCalledWith(
        JSON.stringify({ event: 'identified', data: { Tracker_ID: 1 } }),
      );
      expect((mockClient as any).trackerId).toBe(1);
    });

    it('should send error if tracker ID not found in DB', async () => {
      mockTrackersService.findOne.mockResolvedValue(null);

      await gateway.handleIdentify(mockClient as any, { Tracker_ID: 999 });

      expect(mockClient.send).toHaveBeenCalledWith(
        JSON.stringify({ event: 'error', data: 'Tracker ID not found, please re-register' }),
      );
      expect(mockTrackersService.setOnlineStatus).not.toHaveBeenCalled();
    });
  });

  describe('handleGps', () => {
    it('should save GPS location if client is identified', async () => {
      mockClient.trackerId = 1;
      const payload = { Tracker_ID: 1, lat: 55.123, lng: 9.456 };

      mockGpsService.saveLocation.mockResolvedValue(undefined);

      await gateway.handleGps(mockClient as any, payload);

      expect(mockGpsService.saveLocation).toHaveBeenCalledWith({
        Tracker_ID: 1,
        lat: 55.123,
        lng: 9.456,
      });
    });

    it('should send error if client is not identified', async () => {
      mockClient.trackerId = null;

      await gateway.handleGps(mockClient as any, { Tracker_ID: 0, lat: 55.123, lng: 9.456 });

      expect(mockClient.send).toHaveBeenCalledWith(
        JSON.stringify({ event: 'error', data: 'Not identified, please identify or register first' }),
      );
      expect(mockGpsService.saveLocation).not.toHaveBeenCalled();
    });
  });

  describe('handleBattery', () => {
    it('should update battery if client is identified', async () => {
      mockClient.trackerId = 1;
      mockTrackersService.updateBattery.mockResolvedValue(undefined);

      await gateway.handleBattery(mockClient as any, { battery: 42 });

      expect(mockTrackersService.updateBattery).toHaveBeenCalledWith(1, 42);
    });

    it('should do nothing if client is not identified', async () => {
      mockClient.trackerId = null;

      await gateway.handleBattery(mockClient as any, { battery: 42 });

      expect(mockTrackersService.updateBattery).not.toHaveBeenCalled();
    });
  });
});