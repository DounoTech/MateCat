<?php
/**
 * Created by PhpStorm.
 * @author domenico domenico@translated.net / ostico@gmail.com
 * Date: 14/04/17
 * Time: 21.42
 *
 */

namespace API\V2\Json;


use API\App\Json\OutsourceConfirmation;
use CatUtils;
use Jobs_JobStruct;
use Langs_Languages;
use ManageUtils;
use WordCount_Struct;

class Job {

    /**
     * @param $jStruct Jobs_JobStruct
     *
     * @return array
     */
    public function renderItem( Jobs_JobStruct $jStruct ) {

        $outsourceInfo = $jStruct->getOutsource();
        $tStruct       = $jStruct->getTranslator();
        $outsource     = null;
        $translator    = null;
        if ( !empty( $outsourceInfo ) ) {
            $outsource = ( new OutsourceConfirmation( $outsourceInfo ) )->render();
        } else {
            $translator = ( !empty( $tStruct ) ? ( new JobTranslator() )->renderItem( $tStruct ) : null );
        }

        $jobStats = new WordCount_Struct();
        $jobStats->setIdJob( $jStruct->id );
        $jobStats->setDraftWords( $jStruct->draft_words + $jStruct->new_words ); // (draft_words + new_words) AS DRAFT
        $jobStats->setRejectedWords( $jStruct->rejected_words );
        $jobStats->setTranslatedWords( $jStruct->translated_words );
        $jobStats->setApprovedWords( $jStruct->approved_words );

        $lang_handler = Langs_Languages::getInstance();

        $jArray                      = $jStruct->getArrayCopy();
        $jArray[ 'jid' ]             = $jStruct->id;
        $jArray[ 'jpassword' ]       = $jStruct->password;
        $jArray[ 'features' ]        = $jStruct->getProjectFeatures();
        $jArray[ 'status_analysis' ] = $jStruct->getProject()->status_analysis;

        return [
                'id'                    => (int)$jStruct->id,
                'password'              => $jStruct->password,
                'source'                => $jStruct->source,
                'target'                => $jStruct->target,
                'sourceTxt'             => $lang_handler->getLocalizedName( $jStruct->source ),
                'targetTxt'             => $lang_handler->getLocalizedName( $jStruct->target ),
                'status'                => $jStruct->status,
                'subject'               => $jStruct->subject,
                'owner'                 => $jStruct->owner,
                'open_threads_count'    => $jStruct->getOpenThreadsCount(),
                'create_date'           => $jStruct->create_date,
                'formatted_create_date' => ManageUtils::formatJobDate( $jStruct->create_date ),
                'quality_overall'       => CatUtils::getQualityOverallFromJobArray( $jArray ),
                'private_tm_key'        => json_encode( $jStruct->getOwnerKeys() ),
                'warnings_count'        => $jStruct->getWarningsCount(),
                'stats'                 => CatUtils::getFastStatsForJob( $jobStats ),
                'outsource'             => $outsource,
                'translator'            => $translator,
        ];

    }

}