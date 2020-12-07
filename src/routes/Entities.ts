import {Request, Response, Router} from 'express';
import StatusCodes from 'http-status-codes';
import EntityDao from "@daos/Entity/EntityDao.mock";
import {mapDataToJsonLd, mapMetadataToJsonLd} from "@shared/mapper";
import {convertToCsv, findDocumentTitleOrName} from "@shared/functions";
import url from 'url';
import jsonld from "jsonld";

const router = Router();
const entityDao = new EntityDao();


// filterable list, metadata in both human-readable and application/ld+json form
router.get('/', async (req: Request, res: Response) => {
    let entities = await entityDao.getAll();

    const url_parts = url.parse(req.url);

    const header = {
        "@context": "http://schema.org/",
        "@type": "WPHeader",
        "headline": "All Records",
        "alternativeHeadline": "Count: " + entities.length,
        "potentialAction": {
            "@context": "http://schema.org/",
            "@type": "Action",
            "name": "Download all as CSV",
            "url": (process.env.IRI_PREFIX_OF_SELF ?? "http://localhost") +
                (url_parts.query ? `/entity/csv?${url_parts.query}` : '/entity/csv')
        }
    };

    const typeFilter = req.query.type;

    if (typeFilter) {
        if (Array.isArray(typeFilter)) {
            entities = entities.filter(e => (typeFilter as string[]).includes(e.semantics.baseType))
            header["alternativeHeadline"] = " of types " + (typeFilter as string[]).join(", ");
        } else {
            entities = entities.filter(e => e.semantics.baseType === typeFilter)
            header["alternativeHeadline"] = " of type " + typeFilter;
        }
    }

    const idFilter = req.query.id

    if (idFilter) {
        if (Array.isArray(idFilter)) {
            entities = entities.filter(e => (idFilter as string[]).includes(e.id as string))
        } else {
            entities = entities.filter(e => e.id === idFilter)
        }
        header["headline"] = "Selected records"
        header["alternativeHeadline"] = "by ID filter";
    }

    const jsonldArray = [];
    for (const entity of entities) {

        const dataJsonLd = mapDataToJsonLd(entity);
        const entityName = await findDocumentTitleOrName(dataJsonLd);

        jsonldArray.push({
            "@context": "http://schema.org/",
            "@type": "WebPage",
            "headline": entityName,
            "identifier": (process.env.IRI_PREFIX_OF_SELF ?? "http://localhost") + "/entity/" + entity.id
        });
    }

    const jsonLd = {
        "@graph": [
            header,
            ...jsonldArray
        ]
    }

    return res.render("index", {
        jsonLd,
        jsonLdFlattened: await jsonld.flatten(jsonLd, {}),
        entityDao
    });
});

// filterable list, metadata in text/csv form
router.get('/csv', async (req: Request, res: Response) => {
    let entities = await entityDao.getAll();

    const typeFilter = req.query.type;

    if (typeFilter) {
        if (Array.isArray(typeFilter)) {
            entities = entities.filter(e => (typeFilter as string[]).includes(e.semantics.baseType))
        } else {
            entities = entities.filter(e => e.semantics.baseType === typeFilter)
        }
    }

    const idFilter = req.query.id

    if (idFilter) {
        if (Array.isArray(idFilter)) {
            entities = entities.filter(e => (idFilter as string[]).includes(e.id as string))
        } else {
            entities = entities.filter(e => e.id === idFilter)
        }
    }

    const csvString = convertToCsv(entities);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="records-selected.csv"`);
    res.end(csvString);
});


// metadata + data in both human-readable and application/ld+json form
router.get('/:id', async (req: Request, res: Response) => {
    const entity = await entityDao.getOne(req.params.id);
    if (entity === null) {
        res.status(StatusCodes.NOT_FOUND).send('Not found');
        return;
    }

    const dataJsonLd = mapDataToJsonLd(entity);
    const entityName = await findDocumentTitleOrName(dataJsonLd);
    const metaDataJsonLd = mapMetadataToJsonLd(entity, entityName);

    const jsonLd = {
        "@graph": [
            {
                "@context": "http://schema.org/",
                "@type": "WPHeader",
                "headline": entityName,
                "alternativeHeadline": "Record ID: " + req.params.id
            },
            dataJsonLd,
            metaDataJsonLd
        ]
    }

    return res.render("index", {
        jsonLd,
        jsonLdFlattened: await jsonld.flatten(jsonLd, {}),
        entityDao
    });

});


// data as text/csv
router.get('/:id/csv', async (req: Request, res: Response) => {
    const entity = await entityDao.getOne(req.params.id);
    if (entity === null) {
        res.status(StatusCodes.NOT_FOUND).send('Not found');
        return;
    }

    const csvString = convertToCsv([entity]);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="record-${entity?.id ?? 'ID'}.csv"`);
    res.end(csvString);
});


// data as application/ld+json
router.get('/:id/data', async (req: Request, res: Response) => {
    const entity = await entityDao.getOne(req.params.id);
    if (entity === null) {
        res.status(StatusCodes.NOT_FOUND).send('Not found');
        return;
    }

    const jsonLd = mapDataToJsonLd(entity);

    res.setHeader('Content-Type', 'application/ld+json');
    res.end(JSON.stringify(jsonLd, null, 3));
});


export default router;
