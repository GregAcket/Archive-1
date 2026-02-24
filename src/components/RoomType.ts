export class RoomType {
    public id: number;
    public name: string;
    public price: number;

    static STANDARD: RoomType = new RoomType(1, "Standard", 80);
    static DELUXE: RoomType = new RoomType(2, "Deluxe", 120);

    constructor(id: number, name: string, price: number) {
        this.id = id;
        this.name = name;
        this.price = price;
    }

    static all(): RoomType[] {
        return [RoomType.STANDARD, RoomType.DELUXE];
    }

     priceLabel(): string{
        return `${this.name}  -  ${this.price} €/nuit`;
    }

    static findById(selectedRoomId: number) {
        return RoomType.all().find(roomType => roomType.id === selectedRoomId)!;
    }
}