import {Request, Response, Router} from 'express';
import EntityDao from "@daos/Entity/EntityDao.mock";
import jsonld from "jsonld";

const router = Router();
const entityDao = new EntityDao();


router.get('/', async (req: Request, res: Response) => {
    const types = entityDao.getAllBaseTypes();

    const jsonldArray = types.map(e => ({
        "@context": "http://schema.org/",
        "@type": "WebPage",
        "headline": e,
        "identifier": (process.env.IRI_PREFIX_OF_SELF ?? "http://localhost") + "/entity?type=" + encodeURIComponent(e)
    }));

    const jsonLd = {
        "@graph": [
            {
                "@context": "http://schema.org/",
                "@type": "WPHeader",
                "headline": "List of indexed types",
                "alternativeHeadline": "Count: " + types.length,
            },
            ...jsonldArray
        ]
    }

    return res.render("index", {
        jsonLd,
        jsonLdFlattened: await jsonld.flatten(jsonLd, {}),
        entityDao
    });
});


export default router;
