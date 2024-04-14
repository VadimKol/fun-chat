import { Car, Winner } from '../util/types';

interface Speed {
  velocity: number;
  distance: number;
}

interface Aborted {
  controller: AbortController;
  carId: number;
}

class AsyncAPI {
  private cars: Car[];

  private car: Car;

  private winner: Winner;

  private winners: Winner[];

  private isCreated: boolean;

  private isWinnerCreated: boolean;

  private isDeleted: boolean;

  private isWinnerDeleted: boolean;

  private isUpdated: boolean;

  private isWinnerUpdated: boolean;

  private isStarted: boolean;

  private isStopped: boolean;

  public aborted: Aborted[];

  constructor() {
    this.cars = [];
    this.car = { name: '', color: '#ffffff', id: 0 };
    this.winners = [];
    this.winner = { id: -1, wins: 0, time: -1 };
    this.isCreated = false;
    this.isWinnerCreated = false;
    this.isDeleted = false;
    this.isWinnerDeleted = false;
    this.isUpdated = false;
    this.isWinnerUpdated = false;
    this.isStarted = false;
    this.isStopped = false;
    this.aborted = [];
  }

  public async getCars(currentPage: number, limit: number) {
    const response = await fetch(`http://127.0.0.1:3000/garage?_page=${currentPage}&_limit=${limit}`, {
      method: 'GET',
      cache: 'no-store',
    });

    const total = response.headers.get('X-Total-Count');

    if (!total) throw new Error('Bad header');

    if (!(response.status === 200)) throw new Error('Response was not OK');

    this.cars = await response.json();

    return { total, cars: this.cars };
  }

  public async getCar(carId: string) {
    const response = await fetch(`http://127.0.0.1:3000/garage/${carId}`, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!(response.status === 200)) throw new Error('Response was not OK');

    this.car = await response.json();

    return this.car;
  }

  public async createCar(car: Car) {
    this.isCreated = false;

    const response = await fetch('http://127.0.0.1:3000/garage', {
      method: 'POST',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: car.name, color: car.color }),
    });

    if (!(response.status === 201)) throw new Error('Response was not OK');

    this.isCreated = true;

    return this.isCreated;
  }

  public async deleteCar(carId: string) {
    this.isDeleted = false;

    const response = await fetch(`http://127.0.0.1:3000/garage/${carId}`, {
      method: 'DELETE',
      cache: 'no-store',
    });

    if (!(response.status === 200)) throw new Error('Response was not OK');

    this.isDeleted = true;

    return this.isDeleted;
  }

  public async updateCar(car: Car) {
    this.isUpdated = false;

    const response = await fetch(`http://127.0.0.1:3000/garage/${car.id}`, {
      method: 'PUT',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: car.name, color: car.color }),
    });

    if (!(response.status === 200)) throw new Error('Response was not OK');

    this.isUpdated = true;

    return this.isUpdated;
  }

  public async startEngine(carId: string) {
    this.isStarted = false;
    const response = await fetch(`http://127.0.0.1:3000/engine?id=${carId}&status=started`, {
      method: 'PATCH',
      cache: 'no-store',
    });

    if (!(response.status === 200)) throw new Error('Response was not OK');

    const carSpeed: Speed = await response.json();

    return Math.floor(carSpeed.distance / carSpeed.velocity);
  }

  public async stopEngine(carId: string) {
    this.isStopped = false;
    const response = await fetch(`http://127.0.0.1:3000/engine?id=${carId}&status=stopped`, {
      method: 'PATCH',
      cache: 'no-store',
    });

    if (!(response.status === 200)) throw new Error('Response was not OK');

    this.isStopped = true;

    return this.isStopped;
  }

  public async driveCar(carId: string) {
    const control = new AbortController();
    this.aborted.push({ controller: control, carId: Number(carId) });

    const response = await fetch(`http://127.0.0.1:3000/engine?id=${carId}&status=drive`, {
      method: 'PATCH',
      cache: 'no-store',
      signal: control.signal,
    });

    if (response.status === 500 || response.status === 404) return false;

    if (!(response.status === 200)) throw new Error('Response was not OK');

    return true;
  }

  public async getWinners(currentPage: number, limit: number, sort: string, order: string) {
    const response = await fetch(
      `http://127.0.0.1:3000/winners?_page=${currentPage}&_limit=${limit}&_sort=${sort}&_order=${order}`,
      { method: 'GET', cache: 'no-store' },
    );
    const total = response.headers.get('X-Total-Count');

    if (!total) throw new Error('Bad header');

    if (!(response.status === 200)) throw new Error('Response was not OK');

    this.winners = await response.json();

    return { total, winners: this.winners };
  }

  public async getWinner(carId: string) {
    this.winner = { id: -1, wins: 0, time: -1 };
    const response = await fetch(`http://127.0.0.1:3000/winners/${carId}`, {
      method: 'GET',
      cache: 'no-store',
    });

    if (response.status === 404) return this.winner;

    if (!(response.status === 200)) throw new Error('Response was not OK');

    this.winner = await response.json();

    return this.winner;
  }

  public async createWinner(winner: Winner) {
    this.isWinnerCreated = false;

    const response = await fetch('http://127.0.0.1:3000/winners', {
      method: 'POST',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(winner),
    });

    if (!(response.status === 201)) throw new Error('Response was not OK');

    this.isWinnerCreated = true;

    return this.isWinnerCreated;
  }

  public async updateWinner(winner: Winner) {
    this.isWinnerUpdated = false;

    const response = await fetch(`http://127.0.0.1:3000/winners/${winner.id}`, {
      method: 'PUT',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wins: winner.wins, time: winner.time }),
    });

    if (!(response.status === 200)) throw new Error('Response was not OK');

    this.isWinnerUpdated = true;

    return this.isWinnerUpdated;
  }

  public async deleteWinner(carId: string) {
    this.isWinnerDeleted = false;

    const response = await fetch(`http://127.0.0.1:3000/winners/${carId}`, {
      method: 'DELETE',
      cache: 'no-store',
    });

    if (!(response.status === 200)) throw new Error('Response was not OK');

    this.isWinnerDeleted = true;

    return this.isWinnerDeleted;
  }
}

export default AsyncAPI;
