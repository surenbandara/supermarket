import mongoose from "mongoose";

export interface ISysConfig extends mongoose.Document {
    name: string;
    value: mongoose.Schema.Types.Mixed;
}

const sysConfigSchema = new mongoose.Schema<ISysConfig>(
    {
        name: { type: String, required: true, unique: true },
        value: { type: mongoose.Schema.Types.Mixed, required: true },
    },
    {
        strict: true,
        timestamps: true,
    }
);

sysConfigSchema.index({ name: 1 }, { unique: true });

sysConfigSchema.set("toJSON", {
    transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        delete ret.createdAt;
        delete ret.updatedAt;
        return ret;
    },
});

sysConfigSchema.set("toObject", {
    transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
    },
});

const SysConfigModel = mongoose.model<ISysConfig>("SysConfig", sysConfigSchema);

export class SysParaCache {
    private static instance: SysParaCache;
    private cache: Map<string, any>;

    private constructor() {
        this.cache = new Map<string, any>();
    }

    public static getInstance(): SysParaCache {
        if (!SysParaCache.instance) {
            SysParaCache.instance = new SysParaCache();
        }
        return SysParaCache.instance;
    }

    public async get(key: string): Promise<any> {
        if (this.has(key)) {
            return this.cache.get(key);
        } else {
            const parameter: ISysConfig | null = await SysConfigModel.findOne({ name: key });
            if (parameter) {
                this.set(parameter.name, parameter.value);
                return parameter.value;
            }
            return null;
        }
    }

    public set(key: string, value: any): void {
        this.cache.set(key, value);
    }

    public has(key: string): boolean {
        return this.cache.has(key);
    }

    public del(key: string): void {
        this.cache.delete(key);
    }

    public flush(): void {
        this.cache.clear();
    }
}

export default SysConfigModel;
