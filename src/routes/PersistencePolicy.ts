import {Request, Response, Router} from 'express';
import EntityDao from "@daos/Entity/EntityDao.mock";
import jsonld from "jsonld";

const router = Router();
const entityDao = new EntityDao();

// // list of entities
router.get('/', async (req: Request, res: Response) => {
    const jsonldArray = [
        {
            "@context": "http://schema.org/",
            "@type": "Article",
            "headline": "Persistence policy of Example FAIRified data portal",
            "identifier": (process.env.IRI_PREFIX_OF_SELF ?? "http://localhost") + "/persistence-policy",
            "articleBody": `
<p>
    <strong>Proof-of-conept, temporary testing service only! Please note that the data contained on this page are
    for demonstration purposes only and NOT scientifically valid in any way!</strong>
</p>`
        }
    ];

    const jsonLd = {
        "@graph": [
            {
                "@context": "http://schema.org/",
                "@type": "WPHeader",
                "headline": "Persistence policy",
                "alternativeHeadline": "of Example FAIRified data portal",
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
