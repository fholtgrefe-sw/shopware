<?php declare(strict_types=1);

namespace Shopware\Tests\Unit\Core\Framework\App\Flow\Event;

use PHPUnit\Framework\TestCase;
use Shopware\Core\Framework\App\Flow\Event\Event;
use Shopware\Core\System\SystemConfig\Exception\XmlParsingException;

/**
 * @internal
 *
 * @covers \Shopware\Core\Framework\App\Flow\Event\Event
 */
class FlowEventTest extends TestCase
{
    public function testCreateFromXmlFile(): void
    {
        $xmlFile = \dirname(__FILE__, 3) . '/_fixtures/Resources/flow.xml';
        $result = Event::createFromXmlFile($xmlFile);
        static::assertNotNull($result->getCustomEvents());
        static::assertNotEmpty($result->getCustomEvents()->getCustomEvents());
        static::assertDirectoryExists($result->getPath());
    }

    public function testCreateFromXmlFileFailed(): void
    {
        $this->expectException(XmlParsingException::class);
        $this->expectExceptionMessageMatches('/Unable to parse file \".*flow-1-0.xml"\. Message: Resource \".*flow-1-0.xml\" is not a file./');
        $xmlFile = \dirname(__FILE__, 3) . '/_fixtures/flow-1-0.xml';
        Event::createFromXmlFile($xmlFile);
    }
}
