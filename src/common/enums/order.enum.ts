export enum OrderStatus {
    CANCEL = 'cancel',
    PENDING = 'pending',
    IN_PROGRESS = 'in-progress',
    OUT_FOR_DELIVERY = 'out-for-delivery',
    ORDER_RECEIVE = 'order-receive',
    COMPLETE = 'complete',
    ACCEPTED = 'accepted',
    ASSIGNED = 'assigned',
}

export enum DriverAssignmentStatus {
    ACCEPTED = 'accepted',
    ASSIGNED = 'assigned',
    REJECTED = 'rejected',
    PICKED = 'picked',
    DELIVERED = 'delivered'
}