export class AppointmentEntity {
  serviceId: number;
  serviceName: string = '';
  branchId: number;
  branchName: string = '';
  status: string = '';
  startTime: string = '';
  endTime: string = '';
  publicId: string = '';
  startTimeFormatted: string = '';
  date: string = '';
  qpId: number;
  notes: string;
  custom?: string;
}
