import { NextFunction, Request, Response } from "express";
import { prismaClient } from "../db/prisma";
import { EventSchema } from "../schemas/events";
import { BadRequestsException } from "../exceptions/bad-requests";
import { ErrorCode } from "../exceptions/root";
import { NotFoundException } from "../exceptions/not-found";
import { UnauthorizedException } from "../exceptions/unauthorized";

// Create Event
export const createEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    EventSchema.parse(req.body);
    const user = req.user!;

    const event = await prismaClient.event.create({
      data: {
        eventCreatedById: user.id,
        ...req.body,
      },
    });

    res.json(event);
  } catch (error) {
    next(error);
  }
};

// Fetch All Events
export const fetchAllEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const events = await prismaClient.event.findMany();
    res.json(events);
  } catch (error) {
    next(error);
  }
};

// Fetch Event by ID
export const fetchEventById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const eventId = req.params.id;

    const event = await prismaClient.event.findUnique({
      where: { id: eventId },
      include: {
        eventCreatedBy: true,
        bookings: true,
      },
    });

    if (!event) {
      next(
        new NotFoundException("Event does not exist", ErrorCode.EVENT_NOT_FOUND)
      );
    } else {
      const ownerInfo = {
        email: event.eventCreatedBy.email,
        firstName: event.eventCreatedBy.firstName,
        lastName: event.eventCreatedBy.lastName,
      };
      const bookingStatus = event.bookings.length > 0 ? "Booked" : "Available";
      const eventInfo = {
        id: event.id,
        title: event.title,
        description: event.description,
        price: event.price,
        location: event.location,
        mapData: event.mapData,
        photos: event.photos,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
      };
      res.json({
        ownerInfo,
        bookingStatus,
        eventInfo,
      });
    }
  } catch (error) {
    next(error);
  }
};

// Fetch User Events
export const fetchUserEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user!;

    const events = await prismaClient.event.findMany({
      where: { eventCreatedById: user.id },
    });

    if (!events.length) {
      next(
        new NotFoundException(
          "No events found for this user",
          ErrorCode.USER_DOESNT_HAVE_EVENTS
        )
      );
    }

    res.json(events);
  } catch (error) {
    next(error);
  }
};

// Edit Event
export const editEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const eventId = req.params.id;
    const user = req.user!;
    EventSchema.parse(req.body);

    const event = await prismaClient.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      next(
        new NotFoundException("Event does not exist", ErrorCode.EVENT_NOT_FOUND)
      );
    }

    if (event!.eventCreatedById !== user.id) {
      next(
        new UnauthorizedException(
          "You do not have permission to perform this action",
          ErrorCode.UNAUTHORIZED
        )
      );
    }

    const bookingCount = await prismaClient.booking.count({
      where: { eventId: eventId },
    });

    if (bookingCount > 0) {
      next(
        new BadRequestsException(
          "Cannot update event tied to a booking",
          ErrorCode.EVENT_IS_LOCKED
        )
      );
    }

    const updatedEvent = await prismaClient.event.update({
      where: { id: eventId },
      data: { ...req.body },
    });

    res.json(updatedEvent);
  } catch (error) {
    next(error);
  }
};

// Delete Event
export const deleteEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const eventId = req.params.id;
    const user = req.user!;

    const event = await prismaClient.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      next(
        new NotFoundException("Event does not exist", ErrorCode.EVENT_NOT_FOUND)
      );
    }

    if (event!.eventCreatedById !== user.id) {
      next(
        new UnauthorizedException(
          "You do not have permission to perform this action",
          ErrorCode.UNAUTHORIZED
        )
      );
    }

    const bookingCount = await prismaClient.booking.count({
      where: { eventId: eventId },
    });

    if (bookingCount > 0) {
      next(
        new BadRequestsException(
          "Cannot delete event tied to a booking",
          ErrorCode.EVENT_IS_LOCKED
        )
      );
    }

    await prismaClient.event.delete({
      where: { id: eventId },
    });

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    next(error);
  }
};
