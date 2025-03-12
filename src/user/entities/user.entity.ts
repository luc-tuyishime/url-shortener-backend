import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { UrlEntity } from '../../url/entities/url.entity';

@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    username: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    @Exclude()
    password: string;

    @Column({ nullable: true })
    first_name: string;

    @Column({ nullable: true })
    last_name: string;

    @Column({ nullable: true })
    profile_picture: string;

    @Column({ nullable: true })
    provider: string;

    @Column({ nullable: true })
    provider_id: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @OneToMany(() => UrlEntity, url => url.user)
    urls: UrlEntity[];
}