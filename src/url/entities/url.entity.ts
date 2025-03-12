import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    Index,
    JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';

@Entity('urls')
export class UrlEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    @Index({ unique: true })
    short_code: string;

    @Column()
    long_url: string;

    @Column({ default: 0 })
    clicks: number;

    @CreateDateColumn()
    created_at: Date;

    @Column({ nullable: true })
    expires_at: Date;

    @ManyToOne(() => UserEntity, user => user.urls)
    @JoinColumn({ name: 'user_id' })
    user: UserEntity;

    @Column()
    user_id: string;
}