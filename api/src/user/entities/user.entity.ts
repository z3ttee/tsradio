import { Channel } from "src/channel/entities/channel.entity";
import { Session } from "src/sessions/entities/session.entity";
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";

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