import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { CreateUserDto, UpdateUserDto, CreateRoleDto } from '../dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  // User CRUD
  async createUser(dto: CreateUserDto): Promise<User> 
  {
    const role = await this.findOneRole(dto.Role_ID);
    if (!role) 
    {
      throw new Error(`Role with ID ${dto.Role_ID} not found`);
    }

    const user = this.userRepository.create({
      ...dto,
      role,
    });
    return this.userRepository.save(user);
  }

  async findAllUsers(): Promise<User[]> 
  {
    return this.userRepository.find({
      relations: ['role'],
    });
  }

  async findOneUser(userId: number): Promise<User | null> 
  {
    return this.userRepository.findOne({
      where: { User_ID: userId },
      relations: ['role'],
    });
  }

  async updateUser(userId: number, dto: UpdateUserDto): Promise<User | null> 
  {
    await this.userRepository.update(userId, dto);
    return this.findOneUser(userId);
  }

  async removeUser(userId: number): Promise<void> 
  {
    await this.userRepository.delete(userId);
  }

  // Role CRUD
  async createRole(dto: CreateRoleDto): Promise<Role> 
  {
    const role = this.roleRepository.create(dto);
    return this.roleRepository.save(role);
  }

  async findAllRoles(): Promise<Role[]> 
  {
    return this.roleRepository.find();
  }

  async findOneRole(roleId: number): Promise<Role | null> 
  {
    return this.roleRepository.findOne({
      where: { Role_ID: roleId },
    });
  }

  async removeRole(roleId: number): Promise<void> 
  {
    await this.roleRepository.delete(roleId);
  }
}