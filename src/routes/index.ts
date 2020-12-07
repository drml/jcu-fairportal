import {Router} from 'express';
import EntitiesRouter from './Entities';
import PersistencePolicyRouter from './PersistencePolicy';
import TypesRouter from './Types';
import RootRouter from './Root';

// Init router and path
const router = Router();

// Add sub-routes
router.use('/', RootRouter);
router.use('/entity', EntitiesRouter);
router.use('/type', TypesRouter);
router.use('/persistence-policy', PersistencePolicyRouter);

// Export the base-router
export default router;
