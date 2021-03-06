<?php

namespace APIBundle\Controller\Exercise\Event;

use APIBundle\Entity\Audience;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use FOS\RestBundle\Controller\Annotations as Rest;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use APIBundle\Entity\Exercise;
use APIBundle\Form\Type\InjectType;
use APIBundle\Entity\Event;
use APIBundle\Entity\Incident;
use APIBundle\Entity\Inject;

class InjectController extends Controller
{
    /**
     * @ApiDoc(
     *    description="List injects of an event"
     * )
     *
     * @Rest\View(serializerGroups={"inject"})
     * @Rest\Get("/exercises/{exercise_id}/events/{event_id}/injects")
     */
    public function getExercisesEventsInjectsAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('APIBundle:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('select', $exercise);

        $event = $em->getRepository('APIBundle:Event')->find($request->get('event_id'));
        /* @var $event Event */

        if (empty($event) || $event->getEventExercise() !== $exercise) {
            return $this->eventNotFound();
        }

        $incidents = $em->getRepository('APIBundle:Incident')->findBy(['incident_event' => $event]);
        /* @var $incidents Incident[] */

        $injects = array();
        foreach( $incidents as $incident ) {
            $incidentInjects = $em->getRepository('APIBundle:Inject')->findBy(['inject_incident' => $incident]);
            foreach( $incidentInjects as &$incidentInject ) {
                $incidentInject->setInjectEvent($event->getEventId());
            }
            $injects = array_merge($injects, $incidentInjects);
        }

        $audiences = $em->getRepository('APIBundle:Audience')->findBy(['audience_exercise' => $exercise], array('audience_name' => 'ASC'));
        /* @var $audiences Audience[] */

        foreach( $injects as &$inject ) {
            $inject->sanitizeUser();
            $inject->computeUsersNumber($audiences);
            $inject->setInjectExercise($exercise->getExerciseId());
        }
        return $injects;
    }

    private function exerciseNotFound()
    {
        return \FOS\RestBundle\View\View::create(['message' => 'Exercise not found'], Response::HTTP_NOT_FOUND);
    }

    private function eventNotFound()
    {
        return \FOS\RestBundle\View\View::create(['message' => 'Event not found'], Response::HTTP_NOT_FOUND);
    }
}