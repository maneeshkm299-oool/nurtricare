import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/data-sources
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const sources = await prisma.healthDataSource.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      sources,
      supportedIntegrations: [
        {
          id: 'manual_csv',
          name: 'Manual CSV Import',
          description: 'Import exported records from fitness trackers or previous apps',
          status: 'ready'
        },
        {
          id: 'google_health_connect',
          name: 'Google Health Connect (Android Companion Bridge)',
          description: 'Ready for companion Android native bridge sync',
          status: 'bridge_ready'
        },
        {
          id: 'fitbit_web_api',
          name: 'Fitbit Web API',
          description: 'Connect via OAuth 2.0 PKCE token exchange',
          status: 'oauth_ready'
        }
      ]
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve data sources' });
  }
});

// POST /api/data-sources/import-csv
// Simple CSV importer for measurements and activities
router.post('/import-csv', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { csvContent, dataType } = req.body;

    if (!csvContent || typeof csvContent !== 'string') {
      res.status(400).json({ error: 'Valid csvContent string is required' });
      return;
    }

    const lines = csvContent.trim().split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) {
      res.status(400).json({ error: 'CSV must contain a header and at least one data row' });
      return;
    }

    const header = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/"/g, ''));
    let importedCount = 0;

    if (dataType === 'measurements') {
      const dateIdx = header.findIndex(h => h.includes('date'));
      const weightIdx = header.findIndex(h => h.includes('weight'));
      const waistIdx = header.findIndex(h => h.includes('waist'));
      const fatIdx = header.findIndex(h => h.includes('fat'));

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim().replace(/"/g, ''));
        const dateVal = dateIdx !== -1 ? cols[dateIdx] : null;
        const weightVal = weightIdx !== -1 ? parseFloat(cols[weightIdx]) : null;
        const waistVal = waistIdx !== -1 ? parseFloat(cols[waistIdx]) : null;
        const fatVal = fatIdx !== -1 ? parseFloat(cols[fatIdx]) : null;

        if (weightVal && !isNaN(weightVal)) {
          await prisma.bodyMeasurement.create({
            data: {
              userId,
              weightKg: weightVal,
              waistCm: waistVal && !isNaN(waistVal) ? waistVal : null,
              bodyFatPercentage: fatVal && !isNaN(fatVal) ? fatVal : null,
              recordedAt: dateVal ? new Date(dateVal) : new Date(),
              source: 'csv_import',
              notes: 'Imported via CSV file'
            }
          });
          importedCount++;
        }
      }
    } else if (dataType === 'activities') {
      const dateIdx = header.findIndex(h => h.includes('date'));
      const typeIdx = header.findIndex(h => h.includes('type') || h.includes('activity'));
      const durationIdx = header.findIndex(h => h.includes('duration') || h.includes('minutes'));
      const stepsIdx = header.findIndex(h => h.includes('step'));
      const calIdx = header.findIndex(h => h.includes('calorie'));

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim().replace(/"/g, ''));
        const dateVal = dateIdx !== -1 ? cols[dateIdx] : null;
        const actType = typeIdx !== -1 ? cols[typeIdx] : 'walking';
        const durationVal = durationIdx !== -1 ? parseInt(cols[durationIdx]) : 30;
        const stepsVal = stepsIdx !== -1 ? parseInt(cols[stepsIdx]) : null;
        const calVal = calIdx !== -1 ? parseFloat(cols[calIdx]) : null;

        if (actType && durationVal && !isNaN(durationVal)) {
          await prisma.activityLog.create({
            data: {
              userId,
              activityType: actType.toLowerCase(),
              durationMinutes: durationVal,
              steps: stepsVal && !isNaN(stepsVal) ? stepsVal : null,
              estimatedCaloriesBurned: calVal && !isNaN(calVal) ? calVal : null,
              recordedAt: dateVal ? new Date(dateVal) : new Date(),
              source: 'csv_import',
              notes: 'Imported via CSV file'
            }
          });
          importedCount++;
        }
      }
    } else {
      res.status(400).json({ error: 'Unsupported dataType. Choose "measurements" or "activities"' });
      return;
    }

    res.json({
      message: `Successfully imported ${importedCount} records.`,
      importedCount
    });
  } catch (error) {
    console.error('CSV import error:', error);
    res.status(500).json({ error: 'Failed to parse and import CSV' });
  }
});

// POST /api/data-sources/sync
router.post('/sync', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { provider } = req.body;

    const source = await prisma.healthDataSource.upsert({
      where: {
        id: req.body.id || 'new-source-placeholder'
      },
      update: {
        lastSyncedAt: new Date(),
        connectionStatus: 'connected'
      },
      create: {
        userId,
        provider: provider || 'manual_sync',
        connectionStatus: 'connected',
        lastSyncedAt: new Date(),
        permissionsGranted: 'read_activity,read_body'
      }
    });

    res.json({
      message: 'Health data source synced successfully',
      source
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to sync data source' });
  }
});

export default router;
