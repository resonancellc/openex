<?php

namespace APIBundle\Controller;

use APIBundle\Entity\Exercise;
use APIBundle\Entity\Grant;
use APIBundle\Form\Type\ExerciseType;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\View\View;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class ExerciseController extends Controller
{
    /**
     * @ApiDoc(
     *    description="List exercises"
     * )
     *
     * @Rest\View(serializerGroups={"exercise"})
     * @Rest\Get("/exercises")
     */
    public function getExercisesAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $user = $this->get('security.token_storage')->getToken()->getUser();

        if ($user->isAdmin()) {
            $exercises = $em->getRepository('APIBundle:Exercise')->findAll();
        } else {
            $grants = $user->getUserGrants();
            /* @var $grants Grant[] */
            $exercises = [];
            /* @var $exercises Exercise[] */
            foreach ($grants as $grant) {
                $exercises[] = $grant->getGrantExercise();
            }
        }

        foreach ($exercises as &$exercise) {
            $events = $em->getRepository('APIBundle:Event')->findBy(['event_exercise' => $exercise]);
            /* @var $events Event[] */

            $injects = array();
            foreach ($events as $event) {
                $incidents = $em->getRepository('APIBundle:Incident')->findBy(['incident_event' => $event]);
                /* @var $incidents Incident[] */

                foreach ($incidents as $incident) {
                    $injects = array_merge($injects, $em->getRepository('APIBundle:Inject')->findBy(['inject_incident' => $incident]));
                }
            }
            $exercise->computeExerciseStatus($injects);
        }

        return $exercises;
    }

    /**
     * @ApiDoc(
     *    description="Read an exercise"
     * )
     *
     * @Rest\View(serializerGroups={"exercise"})
     * @Rest\Get("/exercises/{exercise_id}")
     */
    public function getExerciseAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('APIBundle:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('select', $exercise);

        $events = $em->getRepository('APIBundle:Event')->findBy(['event_exercise' => $exercise]);
        /* @var $events Event[] */

        $injects = array();
        foreach ($events as $event) {
            $incidents = $em->getRepository('APIBundle:Incident')->findBy(['incident_event' => $event]);
            /* @var $incidents Incident[] */

            foreach ($incidents as $incident) {
                $injects = array_merge($injects, $em->getRepository('APIBundle:Inject')->findBy(['inject_incident' => $incident]));
            }
        }
        $exercise->computeExerciseStatus($injects);

        return $exercise;
    }

    /**
     * @ApiDoc(
     *    description="Create an exercise",
     *    input={"class"=ExerciseType::class, "name"=""}
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_CREATED, serializerGroups={"exercise"})
     * @Rest\Post("/exercises")
     */
    public function postExercisesAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $user = $this->get('security.token_storage')->getToken()->getUser();

        if (!$user->isAdmin())
            throw new \Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException();

        $exercise = new Exercise();
        $form = $this->createForm(ExerciseType::class, $exercise);
        $form->submit($request->request->all());

        if ($form->isValid()) {
            $file = $em->getRepository('APIBundle:File')->findOneBy(['file_name' => 'Exercise default']);
            $exercise->setExerciseCanceled(false);
            $exercise->setExerciseOwner($user);
            $exercise->setExerciseImage($file);
            $exercise->setExerciseMessageHeader('EXERCISE - EXERCISE - EXERCISE');
            $exercise->setExerciseMessageFooter('EXERCISE - EXERCISE - EXERCISE');
            $em->persist($exercise);
            $em->flush();
            return $exercise;
        } else {
            return $form;
        }
    }

    /**
     * @ApiDoc(
     *    description="Delete an exercise"
     * )
     *
     * @Rest\View(statusCode=Response::HTTP_NO_CONTENT, serializerGroups={"exercise"})
     * @Rest\Delete("/exercises/{exercise_id}")
     */
    public function removeExerciseAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('APIBundle:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if ($exercise) {
            $this->denyAccessUnlessGranted('delete', $exercise);
            $em->remove($exercise);
            $em->flush();
        }
    }

    /**
     * @ApiDoc(
     *    description="Update an exercise",
     *   input={"class"=ExerciseType::class, "name"=""}
     * )
     *
     * @Rest\View(serializerGroups={"exercise"})
     * @Rest\Put("/exercises/{exercise_id}")
     */
    public function updateExerciseAction(Request $request)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $exercise = $em->getRepository('APIBundle:Exercise')->find($request->get('exercise_id'));
        /* @var $exercise Exercise */

        if (empty($exercise)) {
            return $this->exerciseNotFound();
        }

        $this->denyAccessUnlessGranted('update', $exercise);

        $form = $this->createForm(ExerciseType::class, $exercise);
        $form->submit($request->request->all(), false);
        if ($form->isValid()) {
            $em->persist($exercise);
            $em->flush();
            $em->clear();
            $exercise = $em->getRepository('APIBundle:Exercise')->find($request->get('exercise_id'));
            $events = $em->getRepository('APIBundle:Event')->findBy(['event_exercise' => $exercise]);
            /* @var $events Event[] */

            $injects = array();
            foreach ($events as $event) {
                $incidents = $em->getRepository('APIBundle:Incident')->findBy(['incident_event' => $event]);
                /* @var $incidents Incident[] */

                foreach ($incidents as $incident) {
                    $injects = array_merge($injects, $em->getRepository('APIBundle:Inject')->findBy(['inject_incident' => $incident]));
                }
            }
            $exercise->computeExerciseStatus($injects);
            return $exercise;
        } else {
            return $form;
        }
    }

    private function exerciseNotFound()
    {
        return View::create(['message' => 'Exercise not found'], Response::HTTP_NOT_FOUND);
    }

    private function statusNotFound()
    {
        return View::create(['message' => 'Status not found'], Response::HTTP_NOT_FOUND);
    }
}