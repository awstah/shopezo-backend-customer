import { Repository } from 'typeorm';
import { Products } from '../entities/products.entity';
import { Category } from '../entities/categories.entity';

export async function generateUniqueSlug(
    repo: Repository<Products | Category>,
    title: string,
): Promise<string> {
    // 1) Base slug: lowercase + replace spaces + remove special chars
    let baseSlug = title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '') // remove special chars
        .replace(/\s+/g, '-'); // replace spaces with -

    let slug = baseSlug;
    let counter = 1;

    // 2) Check if slug already exists
    while (await repo.findOne({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }

    return slug;
}
