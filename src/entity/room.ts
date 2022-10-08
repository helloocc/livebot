import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm";

@Entity()
export class RoomEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ nullable: false })
  room_id: string;

  @Column({ default: "@@" })
  topic: string;

  @Column({ default: "" })
  alias: string;

  @Column({ default: "" })
  tag: string;

  @Column({ default: false })
  is_hide: boolean;

  @Column({ default: 0 })
  member_num: number;

  @Column({ default: "" })
  member_ids: string;

  @Column({ default: "" })
  extra_index: string;
}
