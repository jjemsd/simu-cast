import { useState } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface DataQualityCardProps {
  type: 'missing' | 'outliers' | 'duplicates' | 'invalid' | 'text';
  percentage?: number;
  count?: number;
  disabled?: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export default function DataQualityCard({
  type,
  percentage,
  count,
  disabled = false,
  isExpanded,
  onToggleExpand
}: DataQualityCardProps) {
  const [missingValuesFixes, setMissingValuesFixes] = useState({
    meanImputation: false,
    medianImputation: false,
    modeImputation: false,
    forwardFill: false,
    backwardFill: false,
    interpolation: false,
    removeRows: false
  });

  // Handle mutual exclusivity for missing values
  const handleMissingValuesChange = (field: string, checked: boolean) => {
    if (field === 'removeRows' && checked) {
      // When removeRows is checked, uncheck all imputation methods
      setMissingValuesFixes({
        meanImputation: false,
        medianImputation: false,
        modeImputation: false,
        forwardFill: false,
        backwardFill: false,
        interpolation: false,
        removeRows: true
      });
    } else {
      // Normal update
      setMissingValuesFixes(prev => ({ ...prev, [field]: checked }));
    }
  };
  
  const [outliersFixes, setOutliersFixes] = useState({
    capValues: false,
    removeOutliers: false
  });
  
  const [duplicatesFixes, setDuplicatesFixes] = useState({
    removeDuplicates: false
  });

  const [invalidDataFixes, setInvalidDataFixes] = useState({
    removeInvalidRows: false,
    capWithinRange: false
  });

  const [textCleaningOptions, setTextCleaningOptions] = useState({
    convertLowercase: false,
    removePunctuation: false,
    removeExtraSpaces: false
  });

  const handleApplyFix = () => {
    if (type === 'missing') {
      if (!missingValuesFixes.meanImputation && !missingValuesFixes.medianImputation && !missingValuesFixes.modeImputation && !missingValuesFixes.forwardFill && !missingValuesFixes.backwardFill && !missingValuesFixes.interpolation && !missingValuesFixes.removeRows) {
        toast.error('Please select at least one fix option');
        return;
      }
      toast.success('Missing values fixed successfully!');
      setMissingValuesFixes({ meanImputation: false, medianImputation: false, modeImputation: false, forwardFill: false, backwardFill: false, interpolation: false, removeRows: false });
    } else if (type === 'outliers') {
      if (!outliersFixes.capValues && !outliersFixes.removeOutliers) {
        toast.error('Please select at least one fix option');
        return;
      }
      toast.success('Outliers fixed successfully!');
      setOutliersFixes({ capValues: false, removeOutliers: false });
    } else if (type === 'duplicates') {
      if (!duplicatesFixes.removeDuplicates) {
        toast.error('Please select at least one fix option');
        return;
      }
      toast.success('Duplicates removed successfully!');
      setDuplicatesFixes({ removeDuplicates: false });
    } else if (type === 'invalid') {
      if (!invalidDataFixes.removeInvalidRows && !invalidDataFixes.capWithinRange) {
        toast.error('Please select at least one fix option');
        return;
      }
      toast.success('Invalid data fixed successfully!');
      setInvalidDataFixes({ removeInvalidRows: false, capWithinRange: false });
    } else if (type === 'text') {
      if (!textCleaningOptions.convertLowercase && !textCleaningOptions.removePunctuation && !textCleaningOptions.removeExtraSpaces) {
        toast.error('Please select at least one fix option');
        return;
      }
      toast.success('Text data cleaned successfully!');
      setTextCleaningOptions({ convertLowercase: false, removePunctuation: false, removeExtraSpaces: false });
    }
    onToggleExpand();
  };

  const getLabel = () => {
    switch (type) {
      case 'missing': return 'Missing Values';
      case 'outliers': return 'Outliers';
      case 'duplicates': return 'Duplicates';
      case 'invalid': return 'Invalid Data';
      case 'text': return 'Text Data';
    }
  };

  return (
    <div className="space-y-0">
      <div 
        className="bg-white p-4 rounded border border-slate-200 cursor-pointer hover:border-amber-300 transition-all"
        onClick={onToggleExpand}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-700 mb-1">{getLabel()}</p>
            {percentage !== undefined && (
              <p className="text-2xl font-bold text-amber-600">{percentage}%</p>
            )}
            {count !== undefined && (
              <p className="text-2xl font-bold text-amber-600">{count}</p>
            )}
          </div>
          {isExpanded ? (
            <ChevronUp className="text-slate-400 flex-shrink-0" size={24} />
          ) : (
            <ChevronDown className="text-slate-400 flex-shrink-0" size={24} />
          )}
        </div>
      </div>
      
      {/* Expanded Panel */}
      {isExpanded && (
        <div className="bg-white border-x border-b border-slate-200 rounded-b-lg p-4 shadow-sm animate-in slide-in-from-top-2">
          <div className="border-t border-slate-100 pt-3">
            {/* Missing Values Content */}
            {type === 'missing' && (
              <>
                <h5 className="font-medium text-sm mb-3">Missing Value Details</h5>
                
                <div className="mb-4 space-y-2">
                  <p className="text-xs text-slate-500 font-medium mb-2">Affected Columns:</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded">
                      <span className="text-sm">Study Hours</span>
                      <span className="text-xs text-slate-500">12 rows (0.9%)</span>
                    </div>
                    <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded">
                      <span className="text-sm">Attendance Rate</span>
                      <span className="text-xs text-slate-500">43 rows (3.1%)</span>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-slate-500 font-medium mb-2">Suggested Actions:</p>

                  {/* Standard Imputation Group */}
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 mt-1">Standard Imputation</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="mean-imputation"
                        checked={missingValuesFixes.meanImputation}
                        onCheckedChange={(checked) =>
                          handleMissingValuesChange('meanImputation', checked as boolean)
                        }
                        disabled={disabled || missingValuesFixes.removeRows}
                      />
                      <Label
                        htmlFor="mean-imputation"
                        className={`text-sm cursor-pointer ${missingValuesFixes.removeRows ? 'text-slate-400' : ''}`}
                      >
                        Mean imputation (numeric fields)
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="median-imputation"
                        checked={missingValuesFixes.medianImputation}
                        onCheckedChange={(checked) =>
                          handleMissingValuesChange('medianImputation', checked as boolean)
                        }
                        disabled={disabled || missingValuesFixes.removeRows}
                      />
                      <Label
                        htmlFor="median-imputation"
                        className={`text-sm cursor-pointer ${missingValuesFixes.removeRows ? 'text-slate-400' : ''}`}
                      >
                        Median imputation (numeric fields)
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="mode-imputation"
                        checked={missingValuesFixes.modeImputation}
                        onCheckedChange={(checked) =>
                          handleMissingValuesChange('modeImputation', checked as boolean)
                        }
                        disabled={disabled || missingValuesFixes.removeRows}
                      />
                      <Label
                        htmlFor="mode-imputation"
                        className={`text-sm cursor-pointer ${missingValuesFixes.removeRows ? 'text-slate-400' : ''}`}
                      >
                        Mode imputation (categorical fields)
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="remove-rows"
                        checked={missingValuesFixes.removeRows}
                        onCheckedChange={(checked) =>
                          handleMissingValuesChange('removeRows', checked as boolean)
                        }
                        disabled={disabled}
                      />
                      <Label htmlFor="remove-rows" className="text-sm cursor-pointer">
                        Remove rows with missing values
                      </Label>
                    </div>
                  </div>

                  {/* Time-Series Methods Group */}
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Time-Series Methods</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="forward-fill"
                        checked={missingValuesFixes.forwardFill}
                        onCheckedChange={(checked) =>
                          handleMissingValuesChange('forwardFill', checked as boolean)
                        }
                        disabled={disabled || missingValuesFixes.removeRows}
                      />
                      <Label
                        htmlFor="forward-fill"
                        className={`text-sm cursor-pointer ${missingValuesFixes.removeRows ? 'text-slate-400' : ''}`}
                      >
                        Forward fill
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="backward-fill"
                        checked={missingValuesFixes.backwardFill}
                        onCheckedChange={(checked) =>
                          handleMissingValuesChange('backwardFill', checked as boolean)
                        }
                        disabled={disabled || missingValuesFixes.removeRows}
                      />
                      <Label
                        htmlFor="backward-fill"
                        className={`text-sm cursor-pointer ${missingValuesFixes.removeRows ? 'text-slate-400' : ''}`}
                      >
                        Backward fill
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="interpolation"
                        checked={missingValuesFixes.interpolation}
                        onCheckedChange={(checked) =>
                          handleMissingValuesChange('interpolation', checked as boolean)
                        }
                        disabled={disabled || missingValuesFixes.removeRows}
                      />
                      <Label
                        htmlFor="interpolation"
                        className={`text-sm cursor-pointer ${missingValuesFixes.removeRows ? 'text-slate-400' : ''}`}
                      >
                        Linear interpolation
                      </Label>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Outliers Content */}
            {type === 'outliers' && (
              <>
                <h5 className="font-medium text-sm mb-3">Outlier Detection Details</h5>
                
                <div className="mb-4 space-y-2">
                  <p className="text-xs text-slate-500 font-medium mb-2">Columns with Detected Outliers:</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded">
                      <span className="text-sm">Study Hours</span>
                      <span className="text-xs text-slate-500">8 extreme values</span>
                    </div>
                    <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded">
                      <span className="text-sm">Performance Score</span>
                      <span className="text-xs text-slate-500">5 extreme values</span>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded p-2 mt-2">
                    <p className="text-xs text-blue-900">
                      <span className="font-medium">Detection Method:</span> IQR Method
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-slate-500 font-medium mb-2">Suggested Actions:</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="cap-values"
                        checked={outliersFixes.capValues}
                        onCheckedChange={(checked) => 
                          setOutliersFixes(prev => ({ ...prev, capValues: checked as boolean }))
                        }
                        disabled={disabled}
                      />
                      <Label htmlFor="cap-values" className="text-sm cursor-pointer">
                        Cap extreme values
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="remove-outliers"
                        checked={outliersFixes.removeOutliers}
                        onCheckedChange={(checked) => 
                          setOutliersFixes(prev => ({ ...prev, removeOutliers: checked as boolean }))
                        }
                        disabled={disabled}
                      />
                      <Label htmlFor="remove-outliers" className="text-sm cursor-pointer">
                        Remove outliers
                      </Label>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Duplicates Content */}
            {type === 'duplicates' && (
              <>
                <h5 className="font-medium text-sm mb-3">Duplicate Rows Details</h5>
                
                <div className="mb-4">
                  <div className="bg-slate-50 border border-slate-200 rounded p-3">
                    <p className="text-sm">
                      <span className="font-bold text-2xl text-amber-600">27</span>
                      <span className="text-slate-600 ml-2">duplicate rows detected</span>
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-slate-500 font-medium mb-2">Suggested Actions:</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="remove-duplicates"
                        checked={duplicatesFixes.removeDuplicates}
                        onCheckedChange={(checked) => 
                          setDuplicatesFixes(prev => ({ ...prev, removeDuplicates: checked as boolean }))
                        }
                        disabled={disabled}
                      />
                      <Label htmlFor="remove-duplicates" className="text-sm cursor-pointer">
                        Remove exact duplicates
                      </Label>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Invalid Data Content */}
            {type === 'invalid' && (
              <>
                <h5 className="font-medium text-sm mb-3">Invalid Data Details</h5>
                
                <div className="mb-4 space-y-2">
                  <p className="text-xs text-slate-500 font-medium mb-2">Columns with Invalid Data:</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded">
                      <span className="text-sm">Age</span>
                      <span className="text-xs text-slate-500">3 invalid values</span>
                    </div>
                    <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded">
                      <span className="text-sm">Salary</span>
                      <span className="text-xs text-slate-500">2 invalid values</span>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-slate-500 font-medium mb-2">Suggested Actions:</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="remove-invalid-rows"
                        checked={invalidDataFixes.removeInvalidRows}
                        onCheckedChange={(checked) => 
                          setInvalidDataFixes(prev => ({ ...prev, removeInvalidRows: checked as boolean }))
                        }
                        disabled={disabled}
                      />
                      <Label htmlFor="remove-invalid-rows" className="text-sm cursor-pointer">
                        Remove rows with invalid data
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="cap-within-range"
                        checked={invalidDataFixes.capWithinRange}
                        onCheckedChange={(checked) => 
                          setInvalidDataFixes(prev => ({ ...prev, capWithinRange: checked as boolean }))
                        }
                        disabled={disabled}
                      />
                      <Label htmlFor="cap-within-range" className="text-sm cursor-pointer">
                        Cap values within valid range
                      </Label>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Text Data Content */}
            {type === 'text' && (
              <>
                <h5 className="font-medium text-sm mb-3">Text Data Details</h5>
                
                <div className="mb-4 space-y-2">
                  <p className="text-xs text-slate-500 font-medium mb-2">Columns with Text Data:</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded">
                      <span className="text-sm">Comments</span>
                      <span className="text-xs text-slate-500">150 rows</span>
                    </div>
                    <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded">
                      <span className="text-sm">Description</span>
                      <span className="text-xs text-slate-500">200 rows</span>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-slate-500 font-medium mb-2">Suggested Actions:</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="convert-lowercase"
                        checked={textCleaningOptions.convertLowercase}
                        onCheckedChange={(checked) => 
                          setTextCleaningOptions(prev => ({ ...prev, convertLowercase: checked as boolean }))
                        }
                        disabled={disabled}
                      />
                      <Label htmlFor="convert-lowercase" className="text-sm cursor-pointer">
                        Convert to lowercase
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="remove-punctuation"
                        checked={textCleaningOptions.removePunctuation}
                        onCheckedChange={(checked) => 
                          setTextCleaningOptions(prev => ({ ...prev, removePunctuation: checked as boolean }))
                        }
                        disabled={disabled}
                      />
                      <Label htmlFor="remove-punctuation" className="text-sm cursor-pointer">
                        Remove punctuation
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="remove-extra-spaces"
                        checked={textCleaningOptions.removeExtraSpaces}
                        onCheckedChange={(checked) => 
                          setTextCleaningOptions(prev => ({ ...prev, removeExtraSpaces: checked as boolean }))
                        }
                        disabled={disabled}
                      />
                      <Label htmlFor="remove-extra-spaces" className="text-sm cursor-pointer">
                        Remove extra spaces
                      </Label>
                    </div>
                  </div>
                </div>
              </>
            )}

            <Button
              onClick={handleApplyFix}
              disabled={disabled}
              className="w-full bg-amber-500 hover:bg-amber-600"
            >
              <Sparkles size={16} className="mr-2" />
              Apply Selected Fix
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}