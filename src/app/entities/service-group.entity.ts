import { ServiceEntity } from "./service.entity";

export interface ServiceGroupEntity {
    id: string,
    serviceIds: number[],
    selected: boolean,
    names: string[],
    services?: ServiceEntity[],
}