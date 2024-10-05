import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
     @PrimaryGeneratedColumn()
     id: number;

     @Column()
     name: string;

     @Column()
     email: string;

     @Column()
     latitude: string;

     @Column()
     longitude: string;
}
