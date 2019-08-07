import React from 'react'
import classnames from 'classnames'

import './UiTester.less'


// UI-Tester. Inspired by [react-storyboard](https://github.com/storybooks/react-storybook) - but not so bloated


let sections: Section[] = []


export interface TestContext {
    state: any
    forceUpdate: () => void
}

interface Test {
    title: string
    renderTest: (context: TestContext) => JSX.Element
    path: string
    state: any
}


interface Section {
    title: string
    tests: Test[]
    arenaStyle?: any
    renderDecorator?: (testView: JSX.Element) => JSX.Element
}


interface SectionBuilder {
    setArenaStyle(style: any): this
    setDecorator(renderDecorator: (testView: JSX.Element) => JSX.Element): this
    add(title: string, renderTest: (context: TestContext) => JSX.Element): this
}


export function clearAll() {
    sections = []
}

export function addSection(sectionTitle: string): SectionBuilder {
    const tests: Test[] = [],
        section: Section = { title: sectionTitle, tests }

    sections.push(section)

    const sectionBuilder: SectionBuilder = {
        setArenaStyle(style: any) {
            section.arenaStyle = style
            return sectionBuilder
        },

        setDecorator(renderDecorator: (testView: JSX.Element) => JSX.Element) {
            section.renderDecorator = renderDecorator
            return sectionBuilder
        },

        add(title: string, renderTest: (context: TestContext) => JSX.Element) {
            tests.push({
                title,
                renderTest,
                path: '/' + encodePathItem(sectionTitle) + '/' + encodePathItem(title),
                state: {}
            })
            return sectionBuilder
        }
    }

    return sectionBuilder
}


function encodePathItem(pathItem: string) {
    return encodeURIComponent(pathItem.replace(/[ /_]+/g, '_'))
}


export function action(name: string) {
    return (...args: any[]) => {
        console.log('Action ' + name + ':', ...args)
    }
}


interface Props {
    className?: any
}

interface State {
    prevSections: Section[] | null
    currentSection: Section | null
    currentTest: Test | null
}

export default class UiTester extends React.Component<Props, State> {

    static getDerivedStateFromProps(nextProps: Props, prevState: State): Partial<State> | null {
        if (sections !== prevState.prevSections) {
            let currentSection: Section | null = null,
                currentTest: Test | null = null,
                path = location.hash.substring(1) // Remove leading `#`

            for (let section of sections) {
                for (let test of section.tests) {
                    if (test.path == path) {
                        currentSection = section
                        currentTest = test
                        break
                    }
                }

                if (currentTest) {
                    break
                }
            }

            return {
                prevSections: sections,
                currentSection,
                currentTest
            }
        }

        return null
    }

    constructor(props: Props) {
        super(props)
        this.state = {
            prevSections: null,
            currentSection: null,
            currentTest: null
        }
    }

    _showTest(section: Section, test: Test) {
        this.setState({ currentSection: section, currentTest: test })
        location.hash = test.path
    }

    render() {
        const props = this.props
        const state = this.state

        let testView: JSX.Element | null = null
        let arenaStyle: any = undefined
        if (state.currentSection && state.currentTest) {
            testView = state.currentTest.renderTest({
                forceUpdate: this.forceUpdate.bind(this),
                state: state.currentTest.state
            })
            arenaStyle = state.currentSection.arenaStyle
            if (state.currentSection.renderDecorator) {
                testView = state.currentSection.renderDecorator(testView)
            }
        }

        return (
            <div className={classnames(props.className, 'UITester')}>
                <div className="UITester-sidebar">
                    {sections.map((section, sectionIndex) =>
                        <div className="form-group" key={sectionIndex}>
                            <label>{section.title}</label>
                            <div className="btn-group-vertical btn-block" role="group">
                                {section.tests.map((test, testIndex) =>
                                    <button key={testIndex}
                                            className={classnames('btn btn-default', { active: test == state.currentTest })}
                                            onClick={() => this._showTest(section, test)}
                                    >
                                        {test.title}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <div className="UITester-arena" style={arenaStyle}>
                    {testView}
                </div>
            </div>
        )
    }

}
