import { PipeTransform, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';

@Injectable()
export class FetchUserPipe implements PipeTransform {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async transform(supabaseUserId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { supabase_id: supabaseUserId },
      select: ['id', 'supabase_id', 'email', 'username', 'role', 'is_verified'],
    });
    if (!user) {
      throw new NotFoundException('User not found in local DB');
    }
    if (!user.is_verified) {
      throw new ForbiddenException('User is not verified');
    }

    return user;
  }
}
