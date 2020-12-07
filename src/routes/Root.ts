import {Request, Response, Router} from 'express';
import EntityDao from "@daos/Entity/EntityDao.mock";
import jsonld from "jsonld";

const router = Router();
const entityDao = new EntityDao();


// Homepage
router.get('/', async (req: Request, res: Response) => {
    const jsonldArray = [
        {
            "@context": "http://schema.org/",
            "@type": "Article",
            "headline": "Welcome to Example FAIRified data portal!",
            "articleBody": "<p class=\"lead\">" +
                "    This is a demonstration proof-of-concept microservice developed as part of the master" +
                "    thesis <em>\"Open dat in scientific research\"</em> by <a href=\"https://www.ondrejdoktor.cz\" target=\"_blank\">Ondřej Doktor</a>" +
                "    at the <a href=\"https://www.prf.jcu.cz/en/uai\" target=\"_blank\">Institute of applied informatics</a>, Faculty of Science, University of South Bohemia in České Budějovice, Czech Republic." +
                "</p>" +
                "<p>" +
                "    Goal of this thesis is to investigate practical aspects of <a href=\"https://www.go-fair.org/fair-principles/fairification-process/\" target=\"_blank\">FAIRification</a>" +
                "    in relation to the existing scientific data resources which are being produced at the faculty," +
                "    suggest processes and best-practices for doing so, and demonstrate successful application of these by implementing them on a simplified dataset, which is based on real data." +
                "</p>" +
                "<p>" +
                "    The output You are looking at is produced by the microservice solving this goal. This work is closely related to the <a href=\"https://www.unicatdb.org\">UniCatDB project</a> - Universal Catalog Database for biological findings." +
                "</p>" +
                "<p>" +
                "    <strong>Please note that the data presented are for demonstration purposes only and NOT scientifically valid in any way!</strong>" +
                "</p>"
        },
        {
            "@context": "http://schema.org/",
            "@type": "WebPage",
            "headline": "List of indexed types",
            "identifier": (process.env.IRI_PREFIX_OF_SELF ?? "http://localhost") + "/type"
        },
        {
            "@context": "http://schema.org/",
            "@type": "WebPage",
            "headline": "List of all records",
            "identifier": (process.env.IRI_PREFIX_OF_SELF ?? "http://localhost") + "/entity"
        },
    ];

    const jsonLd = {
        "@graph": [
            {
                "@context": "http://schema.org/",
                "@type": "WPHeader",
                "headline": "Home"
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
