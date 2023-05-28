import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { Channel } from "../../channel/entities/channel.entity";
import { Session } from "../../sessions/entities/session.entity";

@Entity()
export class User {

    @PrimaryColumn({ type: "varchar" })
    public id: string;

    @Column({ nullable: false })
    public name: string;

    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public updatedAt: Date;

    @ManyToMany(() => Channel)
    @JoinTable()
    public history: Channel[];

    @OneToMany(() => Session, (s) => s.user)
    public sessions: Session[];

}