import { ObjectId } from 'mongodb';
import { getDb } from '../lib/db';
import {
    YouthEmail,
    CreateYouthEmailRequest,
    YouthEmailResponse,
    BulkUploadResponse,
    YouthEmailQuery
} from '../dtos/youth-email.dto';
import { ConflictError } from '../errors';

class YouthEmailService {
    private get collection() {
        return getDb().collection('youthemails');
    }

    async ensureIndexes() {
        await this.collection.createIndex({ email: 1 }, { unique: true });
    }

    async addEmail(dto: CreateYouthEmailRequest): Promise<YouthEmailResponse> {
        const email = dto.email.toLowerCase().trim();

        const existing = await this.collection.findOne({ email });
        if (existing) {
            throw new ConflictError('Email already exists');
        }

        const newEmail = {
            email,
            isActive: true,
            createdAt: new Date(),
        };

        const result = await this.collection.insertOne(newEmail);

        return {
            _id: result.insertedId.toString(),
            ...newEmail
        };
    }

    async bulkAddEmails(emails: string[]): Promise<BulkUploadResponse> {
        if (emails.length === 0) {
            return { totalProcessed: 0, totalInserted: 0, totalDuplicatesIgnored: 0 };
        }

        const rawTotal = emails.length;
        const normalizedEmails = emails.map(e => e.toLowerCase().trim()).filter(e => !!e && e.includes('@'));
        const uniqueInUpload = Array.from(new Set(normalizedEmails));

        const operations = uniqueInUpload.map(email => ({
            insertOne: {
                document: {
                    email,
                    isActive: true,
                    createdAt: new Date()
                }
            }
        }));

        const buildResponse = (insertedCount: number) => ({
            totalProcessed: rawTotal,
            totalInserted: insertedCount,
            totalDuplicatesIgnored: rawTotal - insertedCount
        });

        try {
            const result = await this.collection.bulkWrite(operations, { ordered: false });
            return buildResponse(result.insertedCount);
        } catch (error: any) {
            const result = error.result;
            const insertedCount = result?.insertedCount ?? result?.nInserted ?? 0;

            if (result?.writeErrors) {
                console.log(`[YouthEmails] Bulk write partially failed. Attempted unique: ${uniqueInUpload?.length}, New inserted: ${insertedCount}, Already in DB: ${result?.writeErrors?.length}`);
            }

            return buildResponse(insertedCount);
        }
    }

    async updateStatus(ids: string[], isActive: boolean) {
        const objectIds = ids.map(id => new ObjectId(id));
        await this.collection.updateMany(
            { _id: { $in: objectIds } },
            { $set: { isActive, updatedAt: new Date() } }
        );
    }

    async deleteEmails(ids: string[]) {
        const objectIds = ids.map(id => new ObjectId(id));
        await this.collection.deleteMany({ _id: { $in: objectIds } });
    }

    async getEmails(query: YouthEmailQuery) {
        const {
            page = 1,
            pageSize = 10,
            search,
            isActive,
            startDate,
            endDate,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = query;

        const filter: any = {};
        if (search) {
            filter.email = { $regex: search, $options: 'i' };
        }
        if (isActive !== undefined) {
            filter.isActive = isActive;
        }

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) {
                filter.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                filter.createdAt.$lte = end;
            }
        }

        const skip = (page - 1) * pageSize;
        const sort: any = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

        const [items, total] = await Promise.all([
            this.collection.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(pageSize)
                .toArray(),
            this.collection.countDocuments(filter)
        ]);

        return {
            items: items.map(item => ({
                ...item,
                _id: item._id.toString()
            })),
            total,
            page,
            pageSize
        };
    }
}

export const youthEmailService = new YouthEmailService();
