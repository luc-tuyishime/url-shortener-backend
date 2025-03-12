import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, Index, JoinColumn } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';

@Entity('urls')
export class UrlEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    @Index({ unique: true })
    shortCode: string;

    @Column()
    longUrl: string;

    @Column({ default: 0 })
    clicks: number;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ nullable: true })
    expiresAt: Date;

    @ManyToOne(() => UserEntity, user => user.urls)
    @JoinColumn({ name: 'userId' })
    user: UserEntity;

    @Column()
    userId: string;
}